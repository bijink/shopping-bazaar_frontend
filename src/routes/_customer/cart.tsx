import { ArrowTopRightOnSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import CartDeleteConfirmation from '../../components/CartDeleteConfirmation';
import CartItemRemoveConfirmation from '../../components/CartItemRemoveConfirmation';
import ForbiddenPage from '../../components/ForbiddenPage';
import LoadingSpinner from '../../components/LoadingSpinner';
import useLocalUser from '../../hooks/useLocalUser';
import { CartItem, CartItemWithBase64Image } from '../../types/global.type';
import { axiosInstance } from '../../utils/axios';
import stringOps from '../../utils/stringOps';

export const Route = createFileRoute('/_customer/cart')({
  component: CartComponent,
});

function CartComponent() {
  const user = useLocalUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [removingCartItemId, setRemovingCartItemId] = useState('');
  const [cartItemRmConfirmDialogOpen, setCartItemRmConfirmDialogOpen] = useState(false);
  const [cartDeleteConfirmDialogOpen, setCartDeleteConfirmDialogOpen] = useState(false);

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

  const changeCartItemQuantityMutation = useMutation({
    mutationFn: (param: { cartItemId: string; count: number }) => {
      return axiosInstance.patch(
        `/customer/change-cart-item-quantity?userId=${user?._id}&cartItemId=${param.cartItemId}&count=${param.count}`,
      );
    },
    onError: (error) => {
      error.message = error.response?.data?.message || error.message;
    },
    onSuccess: () => {},
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart'], refetchType: 'all' });
    },
  });

  const handleCartItemRmBtn = async (itemId: string) => {
    setRemovingCartItemId(itemId);
    setCartItemRmConfirmDialogOpen(true);
  };

  function CartItemDetailsUI({ itemDetails }: { itemDetails: CartItemWithBase64Image }) {
    return (
      <>
        <div className="flex flex-row space-x-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{itemDetails.name}</h2>
          <ArrowTopRightOnSquareIcon
            onClick={() => {
              navigate({
                to: '/product/$productId',
                params: { productId: itemDetails.product_id },
              });
            }}
            className="w-5 cursor-pointer text-indigo-700 dark:text-indigo-500"
          />
        </div>
        <div className="mt-1 flex flex-row space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <p className="">Color:</p>
          <p className="font-semibold">{stringOps.capitalizeFirstWord(itemDetails.color.name)}</p>
        </div>
        <div className="mt-1 flex flex-row space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <p className="">Size:</p>
          <p className="font-semibold">{stringOps.uppercase(itemDetails.size)}</p>
        </div>
      </>
    );
  }

  if (user?.role !== 'customer') return <ForbiddenPage />;
  return (
    <>
      <CartItemRemoveConfirmation
        open={removingCartItemId.length ? cartItemRmConfirmDialogOpen : false}
        setOpen={setCartItemRmConfirmDialogOpen}
        itemId={removingCartItemId}
      />
      <CartDeleteConfirmation
        open={cartDeleteConfirmDialogOpen}
        setOpen={setCartDeleteConfirmDialogOpen}
      />
      <div className="pt-4">
        <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-gray-100">
          Cart Items
        </h3>
        <div className="pt-8">
          {!isCartItemsLoading && cartItems?.length ? (
            <div className="flex flex-col justify-center lg:flex-row lg:space-x-12">
              {/* Cart-item list */}
              <div className="border-t-[1px] border-t-gray-200 lg:w-2/3 dark:border-t-gray-600">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="border-b-[1px] border-b-gray-200 px-3 py-8 sm:py-10 lg:px-0 dark:border-b-gray-600"
                  >
                    <div className="flex flex-row justify-between">
                      <img
                        src={`data:${item.image.mimeType};base64,${item.image.data}`}
                        alt={`product-${item.name}`}
                        className="h-48 w-44 rounded-md object-cover object-center"
                      />
                      <div className="ml-1 flex w-full flex-row justify-end sm:ml-4 sm:justify-between">
                        <div className="hidden sm:block">
                          <CartItemDetailsUI itemDetails={item} />
                        </div>
                        <div className="flex flex-col justify-between">
                          <div className="flex flex-row justify-end">
                            <p className="text-md">
                              <span>&#8377;</span>
                              {item.quantity * item.price}
                            </p>
                          </div>
                          <div className="flex flex-row items-center justify-end border-gray-100 dark:border-gray-600">
                            <button
                              onClick={() => {
                                if (item.quantity === 1) handleCartItemRmBtn(item._id as string);
                                else
                                  changeCartItemQuantityMutation.mutate({
                                    cartItemId: item._id as string,
                                    count: -1,
                                  });
                              }}
                              className="cursor-pointer rounded-l bg-gray-100 px-3.5 py-1 text-indigo-600 duration-100 hover:bg-indigo-600 hover:text-white dark:bg-gray-700 dark:text-gray-100"
                            >
                              -
                            </button>
                            <span className="bg-gray-200 px-3 py-1 dark:bg-gray-600">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                changeCartItemQuantityMutation.mutate({
                                  cartItemId: item._id as string,
                                  count: 1,
                                })
                              }
                              className="cursor-pointer rounded-r bg-gray-100 px-3 py-1 text-indigo-600 duration-100 hover:bg-indigo-600 hover:text-white dark:bg-gray-700 dark:text-gray-100"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex flex-row justify-end">
                            <button
                              type="button"
                              onClick={() => handleCartItemRmBtn(item._id as string)}
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 block sm:hidden">
                      <CartItemDetailsUI itemDetails={item} />
                    </div>
                  </div>
                ))}
              </div>
              {/* cart checkout */}
              <div className="sticky top-10 mt-6 h-full rounded-lg bg-gray-50 px-3 py-6 lg:mt-0 lg:w-1/3 lg:px-6 lg:py-10 dark:bg-gray-900">
                <div className="flex justify-between text-lg font-bold text-gray-500 dark:text-gray-400">
                  <p className="">Total no.of items</p>
                  <p className="mb-1">{cartItems.length}</p>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <p className="">Total amount</p>
                  <p className="mb-1">
                    <span>&#8377;&nbsp;</span>
                    {cartTotalAmout}
                  </p>
                </div>
                <div className="mt-6 flex flex-row space-x-2">
                  <button
                    className="flex w-16 items-center justify-center rounded-md border border-transparent bg-red-700 shadow-sm hover:bg-red-800"
                    data-twe-toggle="tooltip"
                    title="Remove all items"
                    onClick={() => setCartDeleteConfirmDialogOpen(true)}
                  >
                    <TrashIcon className="h-5 w-5 text-white" />
                  </button>
                  <Link
                    from="/cart"
                    to="/place-order"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                  >
                    Place order
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>{isCartItemsLoading ? <LoadingSpinner /> : <p>Cart is empty</p>}</>
          )}
        </div>
      </div>
    </>
  );
}
