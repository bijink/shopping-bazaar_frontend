import { PhotoIcon } from '@heroicons/react/24/solid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { ProductQuickviewOpenContext } from '../contexts';
import { Product } from '../types/global.type';
import { axiosInstance } from '../utils/axios';

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
          'flex h-full w-full items-center justify-center bg-gray-400 dark:bg-gray-600',
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
        <div className="h-full bg-gray-300 dark:bg-gray-700">
          {!loaded && <ImageSkeletonUI animate />}
          <img
            src={src!}
            alt={alt}
            className={twMerge(
              'h-full w-full rounded-lg border border-black border-opacity-10 object-cover object-center group-hover:opacity-75',
            )}
            style={{ opacity: loaded ? 1 : 0 }}
            onLoad={() => setLoaded(true)}
          />
        </div>
      )}
    </div>
  );
}

export default function ProductCard({
  product,
  setQuickviewProduct,
}: {
  product: Product;
  setQuickviewProduct: React.Dispatch<React.SetStateAction<Product>>;
}) {
  const { setOpen } = useContext(ProductQuickviewOpenContext)!;
  const queryClient = useQueryClient();

  const { data: prodImgs, isLoading: isProdImgsFetchLoading } = useQuery({
    queryKey: ['product', product._id, 'product-images', product.images],
    queryFn: async () => {
      if (product.images) {
        const cachedProdImgs: (string | null)[] | undefined = queryClient.getQueryData([
          'products',
          product._id,
          'product-images',
          product.images,
        ]);
        if (cachedProdImgs) return cachedProdImgs;
        const firstImgUrl = await axiosInstance
          .get(`/user/get-image-url/${product.images[0]}`, { timeout: 90000 })
          .then((res) => res.data.imageUrl as string);
        return [firstImgUrl];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div key={product._id} className="group">
      <Link from="/" to="/product/$productId" params={{ productId: product._id as string }}>
        <div className="aspect-w-1 xl:aspect-w-7 relative h-[20rem] w-full overflow-hidden rounded-lg">
          {isProdImgsFetchLoading ? (
            <DisplayImageUI isLoading />
          ) : (
            !!prodImgs && (
              <div className="h-full group-hover:opacity-60">
                <DisplayImageUI src={prodImgs[0]} alt={`product-${product.name}`} />
              </div>
            )
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              setQuickviewProduct({ ...product, images: prodImgs as string[] });
              setOpen(true);
            }}
            className="absolute bottom-0 left-0 mb-[5%] ml-[10%] w-[80%] rounded-md bg-gray-300 bg-opacity-75 px-4 py-2 text-sm text-gray-800 opacity-0 group-hover:opacity-100"
          >
            Quick View
          </button>
        </div>
        <div className="mt-4 sm:hidden">
          <h3 className="text-md text-gray-700 dark:text-gray-100">{product.name}</h3>
          <p className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-300">
            <span>&#8377;</span>
            {product.price}
          </p>
        </div>
        <div className="mt-4 hidden justify-between sm:flex">
          <div>
            <h3 className="text-sm text-gray-700 dark:text-gray-100">{product.name}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-50">{product.category}</p>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-300">
            <span>&#8377;</span>
            {product.price}
          </p>
        </div>
      </Link>
    </div>
  );
}
