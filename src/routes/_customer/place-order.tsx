import { Description, Label, Radio, RadioGroup } from '@headlessui/react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ToastContext } from '../../contexts';
import useLocalUser from '../../hooks/useLocalUser';
import { CartItem, CartItemWithBase64Image } from '../../types/global.type';
import { axiosInstance } from '../../utils/axios';
import { loadScript } from '../../utils/loadScript';

export const Route = createFileRoute('/_customer/place-order')({
  component: PlaceOrderComponent,
});

const paymentMethods = [
  { name: 'Pay on delivery', description: 'Pay on delivery (cash, card, UPI)', value: 'POD' },
  { name: 'Pay online', description: 'Pay now using online payment methods', value: 'POL' },
];

function PlaceOrderComponent() {
  const user = useLocalUser();
  const queryClient = useQueryClient();
  const { setTriggerToast, setToastMessage } = useContext(ToastContext)!;
  const navigate = useNavigate({ from: '/place-order' });

  const [selectedPayMethod, setSelectedPayMethod] = useState(paymentMethods[0]);

  const { data: cartItems, isLoading: isCartItemsLoading } = useQuery({
    queryKey: ['cart', user?._id],
    queryFn: async () => {
      const cartItems: CartItem[] = await axiosInstance
        .get(`/customer/get-cart-items/${user?._id}`)
        .then((res) => res.data.items);
      if (!cartItems) return null;
      const updatedCartItems: CartItemWithBase64Image[] = await Promise.all(
        cartItems.map(async (item) => {
          const image = await axiosInstance
            .get(`/get-image/${item.image}`, { timeout: 90000 })
            .then((res) => res.data);
          return { ...item, image };
        }),
      );
      return updatedCartItems;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!user && user.role === 'customer',
  });
  const { data: cartTotalAmout } = useQuery({
    queryKey: ['cart', 'total-amount', user?._id],
    queryFn: () =>
      axiosInstance
        .get(`/customer/get-cart-amount/${user?._id}`)
        .then((res) => res.data.total_amount),
    staleTime: 1000 * 60 * 5,
    enabled: !!user && user.role === 'customer',
  });

  const formSubmitMutation = useMutation({
    mutationFn: (formData: {
      address: string;
      pincode: string;
      landmark: string;
      mobile: string;
      paymentMethod: string;
      paymentStatus: string;
    }) => {
      return axiosInstance.post(`/customer/place-order/${user?._id}`, formData);
    },
    onError: (error) => {
      error.message = error.response?.data?.message || error.message;
    },
    onSuccess: () => {
      setToastMessage('Order success');
      setTriggerToast(true);
      navigate({ to: '/orders' });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'], refetchType: 'all' });
      await queryClient.invalidateQueries({ queryKey: ['cart'], refetchType: 'all' });
    },
  });

  async function displayRazorpay(orderValues: {
    name: string;
    address: string;
    pincode: string;
    landmark: string;
    mobile: string;
    paymentMethod: string;
  }) {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }
    const order = await axiosInstance.post(`/customer/generate-rzp-order/${user?._id}`);
    if (!order) {
      alert('Server error. Are you online?');
      return;
    }
    // taking the order details
    const { amount, id: order_id, currency } = order.data.paymentOrder;
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID as string,
      amount: amount.toString(),
      currency: currency,
      name: 'Shopping Bazaar',
      description: 'Shopping bazaar payment',
      // image: '',
      order_id: order_id,
      handler: async function (response: RazorpayPaymentResponse) {
        const data = {
          orderCreationId: order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        };
        const result = await axiosInstance.post('/customer/verify-payment', data);
        if (result) {
          formSubmitMutation.mutate({
            ...orderValues,
            paymentStatus: 'success',
          });
        }
      },
      prefill: {
        name: `${user?.fname} ${user?.lname}`,
        email: user?.email,
        contact: orderValues.mobile,
      },
      notes: {
        address: 'Kandengala Software Solutions',
      },
      theme: {
        color: '#4f46e5',
      },
    };
    const rzp = new window.Razorpay(options);
    // rzp.on('payment.failed', () => {
    //   console.log('payment.failed');
    // });
    rzp.open();
  }

  const form = useForm({
    defaultValues: {
      name: '',
      address: '',
      pincode: '',
      landmark: '',
      mobile: '',
    },
    onSubmit: async ({ value }) => {
      if (value.mobile.length === 10 && value.pincode.length === 6) {
        if (selectedPayMethod.value === 'POL') {
          displayRazorpay({
            ...value,
            paymentMethod: selectedPayMethod.value,
          });
        } else {
          formSubmitMutation.mutate({
            ...value,
            paymentMethod: selectedPayMethod.value,
            paymentStatus: 'pending',
          });
        }
      }
    },
  });

  return (
    <div className="pt-4">
      <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Place order</h3>
      <div className="pt-6 lg:pt-8">
        {!isCartItemsLoading && cartItems?.length ? (
          <>
            <p className="text-center text-lg font-bold lg:text-xl">Enter delivery details</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <div className="mt-6 grid grid-cols-5 gap-12">
                <div className="col-span-5 space-y-4 lg:col-span-3">
                  <div className="space-y-2">
                    <form.Field
                      name="name"
                      children={(field) => (
                        <>
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium leading-6 text-black"
                          >
                            Your name
                          </label>
                          <input
                            id={field.name}
                            name={field.name}
                            type="text"
                            required
                            className="w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <form.Field
                      name="address"
                      children={(field) => (
                        <>
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium leading-6 text-black"
                          >
                            Address
                          </label>
                          <textarea
                            id={field.name}
                            name={field.name}
                            rows={3}
                            required
                            className="min-h-[100px] w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <form.Field
                      name="pincode"
                      children={(field) => (
                        <>
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium leading-6 text-black"
                          >
                            Pincode
                          </label>
                          <input
                            id={field.name}
                            name={field.name}
                            type="number"
                            required
                            className="hide-number-input-arrow w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <form.Field
                      name="landmark"
                      children={(field) => (
                        <>
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium leading-6 text-black"
                          >
                            Landmark
                          </label>
                          <input
                            id={field.name}
                            name={field.name}
                            type="text"
                            required
                            className="w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <form.Field
                      name="mobile"
                      children={(field) => (
                        <>
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium leading-6 text-black"
                          >
                            Mobile Number
                          </label>
                          <input
                            id={field.name}
                            name={field.name}
                            type="number"
                            required
                            className="hide-number-input-arrow w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </>
                      )}
                    />
                  </div>
                </div>
                <div className="col-span-5 flex h-fit flex-col space-y-4 rounded-lg border p-6 lg:col-span-2">
                  <div>
                    <p className="">
                      Total amount: <span className="font-bold">&#8377;{cartTotalAmout}</span>
                    </p>
                    <hr className="mt-4" />
                  </div>
                  <div className="pb-6 pt-4">
                    <RadioGroup value={selectedPayMethod} onChange={setSelectedPayMethod}>
                      <Label className="sr-only">Select a plan</Label>
                      <div className="space-y-4">
                        {paymentMethods.map((paymentMethod) => (
                          <Radio
                            key={paymentMethod.value}
                            value={paymentMethod}
                            className="flex cursor-pointer space-x-2"
                          >
                            {({ checked }) => (
                              <>
                                <div>
                                  <input
                                    className="cursor-pointer text-indigo-600 focus:ring-gray-500"
                                    type="radio"
                                    name={paymentMethod.name}
                                    id={paymentMethod.value}
                                    value={paymentMethod.value}
                                    checked={checked}
                                    onChange={() => setSelectedPayMethod(paymentMethod)}
                                  />
                                </div>
                                <div className="flex-1 pt-1">
                                  <Label
                                    as="p"
                                    className={`text-sm font-medium ${
                                      checked ? 'text-indigo-600' : 'text-gray-900'
                                    }`}
                                  >
                                    {paymentMethod.name}
                                  </Label>
                                  <Description as="span" className={`text-sm font-thin text-black`}>
                                    {paymentMethod.description}
                                  </Description>
                                </div>
                              </>
                            )}
                          </Radio>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <>{isCartItemsLoading ? <LoadingSpinner /> : <p>No items in cart to place order</p>}</>
        )}
      </div>
    </div>
  );
}
