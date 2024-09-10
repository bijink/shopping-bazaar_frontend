import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ProductOverview from '../../../components/ProductOverview';
import { Product } from '../../../types/global.type';
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
  const queryClient = useQueryClient();

  const {
    data: product,
    isLoading: isProductFetchLoading,
    isError: isProductFetchError,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => {
      const cachedProducts: Product[] | undefined = queryClient.getQueryData(['admin-products']);
      const cachedProductData =
        cachedProducts?.find((prod) => prod._id === productId) ||
        queryClient.getQueryData(['product', productId]);
      if (cachedProductData) return cachedProductData;
      else return axiosInstance.get(`/admin/get-product?id=${productId}`).then((res) => res.data);
    },
  });
  const {
    data: images,
    isLoading: isImagesFetchLoading,
    isSuccess: isImagesFetchSuccess,
    isError: isImagesFetchError,
  } = useQuery({
    queryKey: ['product-images', productId],
    queryFn: async () => {
      const cachedProduct: Product | undefined = queryClient.getQueryData(['product', productId]);
      return axiosInstance
        .post('/get-multi-images', { images: cachedProduct?.images }, { timeout: 0 })
        .then((res) => res.data.images);
    },
    enabled: !!product,
  });

  const isLoading = isProductFetchLoading || isImagesFetchLoading;
  const isNotFound = !isLoading && isProductFetchError;
  const isSuccess = isImagesFetchSuccess;
  const isError = isImagesFetchError;

  if (isLoading) return <LoadingSpinner size={8} />;
  if (isNotFound) throw notFound({ routeId: '/admin/product/$productId' });
  if (isSuccess) return <ProductOverview product={{ ...product, images }} />;
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
