import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, notFound, useLocation } from '@tanstack/react-router';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ProductOverview from '../../../components/ProductOverview';
import { CustomHistoryState } from '../../../types/global.type';
import { axiosInstance } from '../../../utils/axios';

export const Route = createFileRoute('/admin/product/$productId')({
  loader: ({ params: { productId } }) => {
    if (!/^[a-fA-F0-9]{24}$/.test(productId)) throw notFound();
  },
  component: AdminProductComponent,
  notFoundComponent: () => {
    return (
      <div className="flex flex-col items-center">
        <p>Product not found!</p>
        <Link
          from="/admin/product/$productId"
          to="/admin"
          className="mt-2 inline-flex min-w-28 items-center justify-center space-x-8 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Go to Admin Home
        </Link>
      </div>
    );
  },
});

function AdminProductComponent() {
  const { productId } = Route.useParams();
  const location = useLocation();
  const { product: locationStateProductData } = (location.state as CustomHistoryState) || {};
  const isExactRouteLocation =
    location.pathname.startsWith('/admin/product') &&
    location.pathname.slice(1).split('/').length == 3;

  const {
    data: product,
    isLoading: isProductFetchLoading,
    isError: isProductFetchError,
  } = useQuery({
    queryKey: ['product', productId, locationStateProductData, { status: false }],
    queryFn: () => {
      if (locationStateProductData) return locationStateProductData;
      else return axiosInstance.get(`/admin/get-product?id=${productId}`).then((res) => res.data);
    },
    enabled: isExactRouteLocation,
  });
  const {
    data: images,
    isLoading: isImagesFetchLoading,
    isSuccess: isImagesFetchSuccess,
    isError: isImagesFetchError,
  } = useQuery({
    queryKey: ['product-images', product?.images],
    queryFn: () =>
      axiosInstance
        .post('/get-multi-images', { images: product?.images }, { timeout: 0 })
        .then((res) => res.data.images),
    enabled: !!product?.images,
  });

  const isLoading = isProductFetchLoading || isImagesFetchLoading;
  const isError = isImagesFetchError || !isExactRouteLocation;
  const isNotFound = !isLoading && isProductFetchError;

  if (isLoading) return <LoadingSpinner size={8} />;
  if (isNotFound) throw notFound({ routeId: '/admin/product/$productId' });
  if (isImagesFetchSuccess) return <ProductOverview product2={{ ...product, images }} />;
  if (isError)
    return (
      <div className="flex flex-col items-center">
        <p>Something went wrong!</p>
        <Link
          from="/admin/product/$productId"
          to="/admin"
          className="mt-2 inline-flex min-w-28 items-center justify-center space-x-8 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Go to Admin Home
        </Link>
      </div>
    );
}
