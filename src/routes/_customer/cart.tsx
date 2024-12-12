import { TrashIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import CartDeleteConfirmation from '../../components/CartDeleteConfirmation';
import CartItem from '../../components/CartItem';
import CartItemRemoveConfirmation from '../../components/CartItemRemoveConfirmation';
import ForbiddenPage from '../../components/ForbiddenPage';
import LoadingSpinner from '../../components/LoadingSpinner';
import useLocalUser from '../../hooks/useLocalUser';
import type { CartItem as CartItemType } from '../../types/global.type';
import { axiosInstance } from '../../utils/axios';

export const Route = createFileRoute('/_customer/cart')({
  component: CartComponent,
});

function CartComponent() {
  const user = useLocalUser();

  const [removingCartItemId, setRemovingCartItemId] = useState('');
  const [cartItemRmConfirmDialogOpen, setCartItemRmConfirmDialogOpen] = useState(false);
  const [cartDeleteConfirmDialogOpen, setCartDeleteConfirmDialogOpen] = useState(false);

  const { data: cartItems, isLoading: isCartItemsLoading } = useQuery({
    queryKey: ['cart', user?._id],
    queryFn: async () => {
      const cartItems: CartItemType[] = await axiosInstance
        .get(`/customer/get-cart-items/${user?._id}`)
        .then((res) => res.data.items);
      if (!cartItems) return null;
      return cartItems;
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

  // const changeCartItemQuantityMutation = useMutation({
  //   mutationFn: (param: { cartItemId: string; count: number }) => {
  //     return axiosInstance.patch(
  //       `/customer/change-cart-item-quantity?userId=${user?._id}&cartItemId=${param.cartItemId}&count=${param.count}`,
  //     );
  //   },
  //   onError: (error) => {
  //     error.message = error.response?.data?.message || error.message;
  //   },
  //   onSuccess: () => {},
  //   onSettled: async () => {
  //     await queryClient.invalidateQueries({ queryKey: ['cart'], refetchType: 'all' });
  //   },
  // });

  const handleCartItemRmBtn = async (itemId: string) => {
    setRemovingCartItemId(itemId);
    setCartItemRmConfirmDialogOpen(true);
  };

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
                  <CartItem key={item._id} item={item} handleCartItemRmBtn={handleCartItemRmBtn} />
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
