import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useLocation, useNavigate } from '@tanstack/react-router';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ProductOverview from '../../../components/ProductOverview';
import { CustomHistoryState } from '../../../types/global.type';
import { axiosInstance } from '../../../utils/axios';

export const Route = createFileRoute('/admin/product/$productId')({
  // loader: ({ params: { productId } }) => {
  //   // if (isNaN(Number(productId))) throw notFound();
  // },
  component: ProductComponent,
  notFoundComponent: () => {
    return <p>Product doesn't exist!</p>;
  },
});

function ProductComponent() {
  const { productId } = Route.useParams();
  const location = useLocation();
  const { product: locationStateProductData } = (location.state as CustomHistoryState) || {};
  const isExactRouteLocation =
    location.pathname.startsWith('/admin/product') &&
    location.pathname.slice(1).split('/').length == 3;
  const navigate = useNavigate({ from: '/admin/product/$productId' });

  const { data: product, isLoading: isProductFetchLoading } = useQuery({
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
  // console.log({ product, images, isImagesFetchSuccess });

  const isLoading = isProductFetchLoading || isImagesFetchLoading;

  if (isLoading) return <LoadingSpinner size={8} />;
  if (isImagesFetchSuccess) return <ProductOverview product2={{ ...product, images }} />;
  if (isImagesFetchError)
    return (
      <div className="flex flex-col items-center">
        <p>Something went wrong</p>
        <button
          className="mt-2 inline-flex min-w-28 items-center justify-center space-x-8 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => navigate({ to: '/admin' })}
        >
          Go back to Admin Home page
        </button>
      </div>
    );
}
