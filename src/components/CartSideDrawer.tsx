import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { CartSideDrawerOpenContext } from '../contexts';
import useLocalUser from '../hooks/useLocalUser';
import { CartItem } from '../types/global.type';
import { axiosInstance } from '../utils/axios';
import stringOps from '../utils/stringOps';
import CartItemRemoveConfirmation from './CartItemRemoveConfirmation';

function DisplayImageUI({
  isLoading = false,
  src,
  alt,
}: {
  isLoading?: boolean;
  src?: string | null;
  alt?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  function ImageSkeletonUI({ animate = false }: { animate?: boolean }) {
    return (
      <div
        role="status"
        className={twMerge(
          'flex h-full w-full items-center justify-center rounded-md bg-gray-400 dark:bg-gray-600',
          animate && 'animate-pulse',
        )}
      >
        <PhotoIcon className="h-10 w-10 text-gray-200 dark:text-gray-500" />
      </div>
    );
  }

  return (
    <div className="h-full">
      {isLoading ? (
        <ImageSkeletonUI animate />
      ) : (
        <div className="h-full rounded-md bg-gray-300 dark:bg-gray-700">
          {!loaded && <ImageSkeletonUI animate />}
          <img
            src={src!}
            alt={alt}
            className="h-full w-full object-cover object-center"
            style={{ opacity: loaded ? 1 : 0 }}
            onLoad={() => setLoaded(true)}
          />
        </div>
      )}
    </div>
  );
}

function CartSideDrawerItem({
  item,
  handleRemoveItemFromCart,
}: {
  item: CartItem;
  handleRemoveItemFromCart: (itemId: string) => Promise<void>;
}) {
  const queryClient = useQueryClient();

  const { data: itemImgs, isLoading: isItemImgsFetchLoading } = useQuery({
    queryKey: ['product', item.product_id, 'product-images', item.images],
    queryFn: async () => {
      if (item.images) {
        const cachedProdImgs: (string | null)[] | undefined = queryClient.getQueryData([
          'products',
          item.product_id,
          'product-images',
          item.images,
        ]);
        if (cachedProdImgs) return cachedProdImgs;
        const firstImgUrl = await axiosInstance
          .get(`/get-img-url?key=${item.images[0]}`, { timeout: 90000 })
          .then((res) => res.data.imageUrl as string);
        return [firstImgUrl];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <li key={item._id} className="flex py-6">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-500">
        {isItemImgsFetchLoading ? (
          <DisplayImageUI isLoading />
        ) : (
          !!itemImgs && (
            <div className="h-full">
              <DisplayImageUI src={itemImgs[0]} alt={`product-${item.name}`} />
            </div>
          )
        )}
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900 dark:text-gray-100">
            <h3>{item.name}</h3>
            <p className="ml-4">
              <span>&#8377;</span>
              {item.quantity * item.price}
            </p>
          </div>
          <div className="mt-1 flex flex-row space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <p className="">Color:</p>
            <p className="font-semibold">{stringOps.capitalizeFirstWord(item.color.name)}</p>
          </div>
          <div className="mt-1 flex flex-row space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <p className="">Size:</p>
            <p className="font-semibold">{stringOps.uppercase(item.size)}</p>
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="mt-1 flex flex-row space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <p className="">Qty:</p>
            <p className="font-semibold">{item.quantity}</p>
          </div>
          <div className="flex">
            <button
              type="button"
              onClick={() => handleRemoveItemFromCart(item._id as string)}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
export default function CartSideDrawer({ items }: { items: CartItem[] }) {
  const user = useLocalUser();
  const { open, setOpen } = useContext(CartSideDrawerOpenContext)!;

  const [cartItemRmConfirmDialogOpen, setCartItemRmConfirmDialogOpen] = useState(false);
  const [removingCartItemId, setRemovingCartItemId] = useState('');

  const { data: cartTotalAmout } = useQuery({
    queryKey: ['cart', 'total-amount', user?._id],
    queryFn: () =>
      axiosInstance
        .get(`/customer/get-cart-amount/${user?._id}`)
        .then((res) => res.data.total_amount),
    staleTime: 1000 * 60 * 5,
    enabled: !!user && user.role === 'customer',
  });

  const handleRemoveItemFromCart = async (itemId: string) => {
    setRemovingCartItemId(itemId);
    setCartItemRmConfirmDialogOpen(true);
  };

  return (
    <>
      <CartItemRemoveConfirmation
        open={removingCartItemId.length ? cartItemRmConfirmDialogOpen : false}
        setOpen={setCartItemRmConfirmDialogOpen}
        itemId={removingCartItemId}
      />
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
              >
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl dark:bg-gray-900">
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Shopping cart
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative -m-2 p-2 text-gray-400 hover:text-gray-500 dark:text-gray-100 dark:hover:dark:text-gray-300"
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-8">
                      {items.length ? (
                        <div className="flow-root">
                          <ul
                            role="list"
                            className="-my-6 divide-y divide-gray-200 dark:divide-gray-600"
                          >
                            {items.map((item) => (
                              <CartSideDrawerItem
                                key={item._id}
                                item={item}
                                handleRemoveItemFromCart={handleRemoveItemFromCart}
                              />
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="dark:text-gray-200">Cart is empty</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6 dark:border-gray-600">
                    <div className="flex justify-between text-base font-medium text-gray-500 dark:text-gray-400">
                      <p>Total no.of items</p>
                      <div className="flex flex-row">
                        <p>{items.length}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-base font-medium text-gray-900 dark:text-gray-100">
                      <p>Total amount</p>
                      <div className="flex flex-row">
                        <span>&#8377;</span>
                        <p>{cartTotalAmout}</p>
                      </div>
                    </div>
                    {/* <p className="mt-0.5 text-sm text-gray-500">
                      Shipping and taxes calculated at checkout.
                    </p> */}
                    <div className="mt-6">
                      <Link
                        to="/place-order"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                      >
                        Place order
                      </Link>
                    </div>
                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500 dark:text-gray-300">
                      <p>
                        or{' '}
                        <Link
                          to="/cart"
                          onClick={() => setOpen(false)}
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Go to cart
                          <span aria-hidden="true"> &rarr;</span>
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
