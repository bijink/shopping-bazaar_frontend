import { Description, Label, Radio, RadioGroup } from '@headlessui/react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import ForbiddenPage from '../../components/ForbiddenPage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ToastContext } from '../../contexts';
import useLocalUser from '../../hooks/useLocalUser';
import { CartItem, CartItemWithBase64Image, User, UserAddress } from '../../types/global.type';
import { axiosInstance } from '../../utils/axios';
import { loadScript } from '../../utils/loadScript';
import stringOps from '../../utils/stringOps';

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

  const { data: userDetails, isLoading } = useQuery({
    queryKey: ['user', user?._id],
    queryFn: () =>
      axiosInstance.get(`user/get-user-details/${user?._id}`).then((res) => res.data as User),
    staleTime: 1000 * 60 * 5,
    enabled: !!user && user.role === 'customer',
  });
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
      address: UserAddress;
      mobile: string;
      paymentMethod: string;
      paymentStatus: string;
    }) => {
      return axiosInstance.post(`/customer/place-order/${user?._id}`, formData);
    },
    onError: (error) => {
      error.message = error.response?.data?.message || error.message;
    },
    onSuccess: async () => {
      setToastMessage('Order success');
      setTriggerToast(true);
      await queryClient.invalidateQueries({ queryKey: ['orders'], refetchType: 'all' });
      await queryClient.invalidateQueries({ queryKey: ['cart'], refetchType: 'all' });
      navigate({ to: '/orders' });
    },
  });

  async function displayRazorpay(orderValues: {
    address: UserAddress;
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
    onSubmit: async () => {
      if (userDetails) {
        if (selectedPayMethod.value === 'POL') {
          displayRazorpay({
            address: userDetails.address!,
            mobile: userDetails.mobile!,
            paymentMethod: selectedPayMethod.value,
          });
        } else {
          formSubmitMutation.mutate({
            address: userDetails.address!,
            mobile: userDetails.mobile!,
            paymentMethod: selectedPayMethod.value,
            paymentStatus: 'pending',
          });
        }
      }
    },
  });

  if (user?.role !== 'customer') return <ForbiddenPage />;
  return (
    <div className="pt-4">
      <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-gray-100">
        Place order
      </h3>
      <div className="pt-6 lg:pt-8">
        {!isCartItemsLoading && cartItems?.length ? (
          <>
            <p className="text-center text-lg font-bold lg:text-xl">Delivery details</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <div className="mt-6 grid grid-cols-5 gap-12">
                <div className="col-span-5 space-y-4 lg:col-span-3">
                  {userDetails && (
                    <>
                      {!isLoading && (
                        <div className="w-1/2">
                          {userDetails?.address ? (
                            <div>
                              <p className="font-bold text-gray-500 dark:text-gray-400">
                                ADDRESS:{' '}
                              </p>
                              <div className="pl-3">
                                <p className="font-bold">{userDetails?.address?.fullname}</p>
                                <p className="">{userDetails?.address?.building},</p>
                                <p className="">
                                  <span>{userDetails?.address?.street}</span>,{' '}
                                  <span>{userDetails?.address?.town}</span>,
                                </p>
                                <p className="">
                                  <span>
                                    {stringOps.uppercase(userDetails?.address?.state as string)}
                                  </span>{' '}
                                  <span className="">{userDetails?.address?.pincode}</span>{' '}
                                  <span className="">India</span>
                                </p>
                              </div>
                              <p className="font-bold text-gray-500 dark:text-gray-400">
                                PHONE NUMBER:{' '}
                                <span className="text-gray-900 dark:text-gray-100">
                                  {userDetails?.mobile}
                                </span>
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p>No address is added</p>
                              <button
                                className="mt-6 flex w-full justify-center rounded-md bg-red-600 px-5 py-1 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 lg:max-w-fit"
                                onClick={() => navigate({ from: '/place-order', to: '/account' })}
                              >
                                Add address
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="col-span-5 flex h-fit flex-col space-y-4 rounded-lg border p-6 lg:col-span-2 dark:border-gray-600">
                  <div>
                    <p className="">
                      Total amount: <span className="font-bold">&#8377;{cartTotalAmout}</span>
                    </p>
                    <hr className="mt-4 dark:border-gray-600" />
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
                                      checked
                                        ? 'text-indigo-600 dark:text-indigo-500'
                                        : 'text-gray-900 dark:text-gray-100'
                                    }`}
                                  >
                                    {paymentMethod.name}
                                  </Label>
                                  <Description
                                    as="span"
                                    className={`text-sm font-thin text-black dark:text-white`}
                                  >
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
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400"
                    disabled={!userDetails?.address}
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <>{isCartItemsLoading ? <LoadingSpinner /> : <p>No items in cart to place an order</p>}</>
        )}
      </div>
    </div>
  );
}
