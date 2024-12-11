import { Radio, RadioGroup } from '@headlessui/react';
import { PhotoIcon, SlashIcon } from '@heroicons/react/24/solid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { ToastContext } from '../contexts';
import useLocalUser from '../hooks/useLocalUser';
import { Product } from '../types/global.type';
import { axiosInstance } from '../utils/axios';
import stringOps from '../utils/stringOps';
import ProductDeleteConfirmation from './ProductDeleteConfirmation';

function DisplayImageUI({
  isLoading = false,
  alt,
  src,
}: {
  isLoading?: boolean;
  alt?: string;
  src?: string | null;
}) {
  const [loaded, setLoaded] = useState(false);

  function ImageSkeletonUI({
    animate = false,
    noImage = false,
  }: {
    animate?: boolean;
    noImage?: boolean;
  }) {
    return (
      <div
        role="status"
        className={twMerge(
          'flex h-full items-center justify-center rounded-lg',
          animate && 'animate-pulse',
          noImage ? 'bg-gray-300 dark:bg-gray-700' : 'bg-gray-400 dark:bg-gray-600',
        )}
      >
        <div className="flex items-center justify-center">
          <PhotoIcon className="h-[2.5rem] w-[2.5rem] text-gray-200 dark:text-gray-500" />
          {noImage && (
            <SlashIcon className="absolute h-[4rem] w-[4rem] -rotate-[75deg] text-gray-300 dark:text-gray-700" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {isLoading || src === undefined ? (
        <ImageSkeletonUI animate />
      ) : src ? (
        <div className="h-full">
          {!loaded && <ImageSkeletonUI animate />}
          <img
            alt={alt}
            src={src}
            className="h-full w-full rounded-lg border border-black border-opacity-10 object-cover object-center"
            style={{ opacity: loaded ? 1 : 0 }}
            onLoad={() => setLoaded(true)}
          />
        </div>
      ) : (
        <ImageSkeletonUI noImage />
      )}
    </div>
  );
}

export default function ProductOverview({
  product,
  isAdmin,
}: {
  product: Product;
  isAdmin?: boolean;
}) {
  const user = useLocalUser();
  const queryClient = useQueryClient();

  const { data: prodImgs, isLoading: isProdImgsFetchLoading } = useQuery({
    queryKey: ['product', product._id, 'product-images', product.images],
    queryFn: async () => {
      if (product.images) {
        const cachedProdImgs: (string | null)[] | undefined = queryClient.getQueryData([
          'product',
          product._id,
          'product-images',
          product.images,
        ]);
        if (cachedProdImgs?.length === 1) {
          const imgUrls: (string | null)[] = await Promise.all(
            product.images.slice(1).map(async (imgKey) => {
              if (!imgKey) return null;
              try {
                const res = await axiosInstance.get(`/user/get-image-url/${imgKey}`, {
                  timeout: 90000,
                });
                return res.data.imageUrl as string;
              } catch (error) {
                return null; // Skip the failed request and return null
              }
            }),
          );
          return [cachedProdImgs[0], ...imgUrls];
        }
        const imgUrls: (string | null)[] = await Promise.all(
          product.images.map(async (imgKey) => {
            if (!imgKey) return null;
            try {
              const res = await axiosInstance.get(`/user/get-image-url/${imgKey}`, {
                timeout: 90000,
              });
              return res.data.imageUrl as string;
            } catch (error) {
              return null; // Skip the failed request and return null
            }
          }),
        );
        return imgUrls;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (prodImgs?.length === 1) {
      queryClient.invalidateQueries({
        queryKey: ['product', product._id, 'product-images', product.images],
      });
    }
  }, [prodImgs, queryClient, product]);

  const { setTriggerToast, toastCount, setToastCount, setToastMessage } = useContext(ToastContext)!;

  const [openProductDeleteDialog, setOpenProductDeleteDialog] = useState(false);
  const [selectedColor, setSelectedColor] = useState<null | { name: string; hex: string }>(null);
  const [selectedSize, setSelectedSize] = useState<null | string>(null);

  const formSubmitMutation = useMutation({
    mutationFn: (formData: { color: { name: string; hex: string }; size: string }) => {
      return axiosInstance.post(`/customer/add-to-cart/${user?._id}/${product._id}`, formData);
    },
    onError: (error) => {
      error.message = error.response?.data?.message || error.message;
    },
    onSuccess: () => {
      setTriggerToast(true);
      setToastMessage(`${toastCount} item added to cart`);
      setToastCount((prev) => ++prev);
      setSelectedColor(null);
      setSelectedSize(null);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart'], refetchType: 'all' });
    },
  });

  const handleAddToCartSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedColor && selectedSize)
      formSubmitMutation.mutate({ color: selectedColor, size: selectedSize });
  };

  return (
    <div className="">
      {/* Confirmation dialog for deleting product */}
      <ProductDeleteConfirmation
        open={openProductDeleteDialog}
        setOpen={setOpenProductDeleteDialog}
        productId={product._id!}
      />
      <div className="pt-4">
        <div className="mx-auto flex flex-col justify-between sm:flex-row">
          <nav aria-label="Breadcrumb">
            <ol role="list" className="mx-auto flex flex-wrap items-center space-x-2">
              <li>
                <div className="flex items-center">
                  <span className="font-light text-gray-500">&#10098;</span>
                  {product.suitableFor.map((item, i) => (
                    <div key={i} className="flex flex-row items-center">
                      <p className="mr-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {stringOps.capitalizeFirstWord(item)}
                      </p>
                      {i !== product.suitableFor.length - 1 && (
                        <span className="-ml-2 mr-2">&#44;</span>
                      )}
                    </div>
                  ))}
                  <span className="-ml-2 font-light text-gray-500">&#10099;</span>
                  <svg
                    fill="currentColor"
                    width={16}
                    height={20}
                    viewBox="0 0 16 20"
                    aria-hidden="true"
                    className="h-5 w-4 text-gray-300"
                  >
                    <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                  </svg>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <p className="mr-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {stringOps.capitalizeFirstWord(product.category)}
                  </p>
                  <svg
                    fill="currentColor"
                    width={16}
                    height={20}
                    viewBox="0 0 16 20"
                    aria-hidden="true"
                    className="h-5 w-4 text-gray-300"
                  >
                    <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                  </svg>
                </div>
              </li>
              <li className="text-sm">
                <p className="font-medium text-gray-500 dark:text-gray-400">
                  {stringOps.capitalizeFirstWord(product.name)}
                </p>
              </li>
            </ol>
          </nav>
          {user?.role === 'admin' && (
            <div className="flex justify-end">
              <div className="space-x-4">
                <Link
                  to="/admin/product/edit/$productId"
                  params={{ productId: product._id as string }}
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setOpenProductDeleteDialog(true)}
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Image gallery */}
        {isProdImgsFetchLoading ? (
          <div className="mx-auto mt-6 h-[32rem] sm:grid sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
            <div>
              <DisplayImageUI isLoading />
            </div>
            <div className="hidden lg:grid lg:grid-cols-1 lg:gap-y-8">
              <DisplayImageUI isLoading />
              <DisplayImageUI isLoading />
            </div>
            <div className="hidden sm:block">
              <DisplayImageUI isLoading />
            </div>
          </div>
        ) : (
          !!prodImgs && (
            <div className="mx-auto mt-6 h-[32rem] sm:grid sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
              <div className="h-[32rem]">
                <DisplayImageUI src={prodImgs[0]} alt={`product-${product.name}-image_1`} />
              </div>
              <div className="hidden h-[32rem] lg:grid lg:grid-cols-1 lg:gap-y-8">
                <div className="h-[15rem]">
                  <DisplayImageUI src={prodImgs[1]} alt={`product-${product.name}-image_2`} />
                </div>
                <div className="h-[15rem]">
                  <DisplayImageUI src={prodImgs[2]} alt={`product-${product.name}-image_3`} />
                </div>
              </div>
              <div className="hidden h-[32rem] sm:block">
                <DisplayImageUI src={prodImgs[3]} alt={`product-${product.name}-image_4`} />
              </div>
            </div>
          )
        )}

        {/* Product info */}
        <div className="mx-auto pb-16 pt-10 lg:grid lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:pb-24 lg:pt-16">
          <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8 dark:border-gray-600">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-gray-100">
              {stringOps.capitalizeFirstWord(product.name)}
            </h1>
          </div>

          {/* Options */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl tracking-tight text-gray-900 dark:text-gray-100">
              <span>&#8377;</span>
              {product.price}
            </p>

            <form className="mt-10" onSubmit={handleAddToCartSubmit}>
              {/* Colors */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Color</h3>

                <fieldset aria-label="Choose a color" className="mt-4">
                  <RadioGroup
                    value={selectedColor}
                    onChange={setSelectedColor}
                    className="flex items-center space-x-3"
                  >
                    {product.colors.map((color) => (
                      <Radio
                        key={color.name}
                        value={color}
                        aria-label={color.name}
                        className="relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 ring-gray-400 focus:outline-none data-[checked]:ring-2 data-[focus]:data-[checked]:ring data-[focus]:data-[checked]:ring-offset-1"
                      >
                        <span
                          aria-hidden="true"
                          className="h-8 w-8 rounded-full border border-black border-opacity-10"
                          style={{ backgroundColor: color.hex }}
                          data-twe-toggle="tooltip"
                          title={stringOps.capitalizeFirstWord(color.name)}
                        />
                      </Radio>
                    ))}
                  </RadioGroup>
                </fieldset>
              </div>

              {/* Sizes */}
              <div className="mt-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Size</h3>
                  {/* <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Size guide
                  </a> */}
                </div>

                <fieldset aria-label="Choose a size" className="mt-4">
                  <RadioGroup
                    value={selectedSize}
                    onChange={setSelectedSize}
                    className="grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4"
                  >
                    {Object.entries(product.sizes).map(([size, inStock]) => (
                      <Radio
                        key={size}
                        value={size}
                        disabled={!inStock}
                        className={twMerge(
                          'group relative flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none data-[focus]:ring-2 data-[focus]:ring-indigo-500 sm:flex-1 sm:py-6 dark:hover:bg-gray-700',
                          inStock
                            ? 'cursor-pointer bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-gray-200'
                            : 'cursor-not-allowed bg-gray-50 text-gray-200 dark:bg-gray-700 dark:text-gray-500',
                        )}
                      >
                        <span>{size}</span>
                        {inStock ? (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-px rounded-md border-2 border-transparent group-data-[focus]:border group-data-[checked]:border-indigo-500 dark:border-gray-500"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200 dark:border-gray-500"
                          >
                            <svg
                              stroke="currentColor"
                              viewBox="0 0 100 100"
                              preserveAspectRatio="none"
                              className="absolute inset-0 h-full w-full stroke-2 text-gray-200 dark:text-gray-500"
                            >
                              <line
                                x1={0}
                                x2={100}
                                y1={100}
                                y2={0}
                                vectorEffect="non-scaling-stroke"
                              />
                            </svg>
                          </span>
                        )}
                      </Radio>
                    ))}
                  </RadioGroup>
                </fieldset>
              </div>

              {!isAdmin && (
                <button
                  type="submit"
                  disabled={!selectedColor || !selectedSize || user?.role !== 'customer'}
                  className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400 dark:disabled:bg-indigo-900 dark:disabled:text-gray-500"
                >
                  Add to cart
                </button>
              )}
            </form>
          </div>

          <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6 dark:border-gray-600">
            {/* Description and details */}
            <div>
              <h3 className="sr-only">Description</h3>

              <div className="space-y-6">
                <p className="text-base text-gray-900 dark:text-gray-100">{product.description}</p>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Highlights</h3>

              <div className="mt-4">
                <ul role="list" className="list-disc space-y-2 pl-4 text-sm">
                  {product.highlights.map((highlight) => (
                    <li key={highlight} className="text-gray-600 dark:text-gray-300">
                      {stringOps.capitalizeFirstWord(highlight)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Details</h2>
              <div className="mt-4 space-y-6">
                <p className="text-sm text-gray-600 dark:text-gray-300">{product.details}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
