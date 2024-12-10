import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import useLocalUser from '../hooks/useLocalUser';
import type { CartItem } from '../types/global.type';
import { axiosInstance } from '../utils/axios';
import stringOps from '../utils/stringOps';

function CartItemDetailsUI({ itemDetails }: { itemDetails: CartItem }) {
  const navigate = useNavigate();
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
            className="h-full rounded-md object-cover object-center"
            style={{ opacity: loaded ? 1 : 0 }}
            onLoad={() => setLoaded(true)}
          />
        </div>
      )}
    </div>
  );
}

export default function CartItem({
  item,
  handleCartItemRmBtn,
}: {
  item: CartItem;
  handleCartItemRmBtn: (itemId: string) => Promise<void>;
}) {
  const user = useLocalUser();
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

  return (
    <div
      key={item._id}
      className="border-b-[1px] border-b-gray-200 px-3 py-8 sm:py-10 lg:px-0 dark:border-b-gray-600"
    >
      <div className="flex flex-row justify-between">
        <div className="h-48 w-44">
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
              <span className="bg-gray-200 px-3 py-1 dark:bg-gray-600">{item.quantity}</span>
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
  );
}
