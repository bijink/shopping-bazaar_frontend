import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductOverview from '../../components/ProductOverview';
import { Product } from '../../types/global.type';
import { axiosInstance } from '../../utils/axios';

export const Route = createFileRoute('/_customer/product/$productId')({
  loader: ({ params: { productId } }) => {
    if (!/^[a-fA-F0-9]{24}$/.test(productId)) throw notFound();
  },
  component: ProductComponent,
  notFoundComponent: () => {
    return (
      <div className="flex flex-col items-center">
        <p>Product not found!</p>
        <Link
          from="/product/$productId"
          to="/"
          className="mt-2 inline-flex min-w-28 items-center justify-center space-x-8 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Go back to Home
        </Link>
      </div>
    );
  },
});

function ProductComponent() {
  const { productId } = Route.useParams();
  const queryClient = useQueryClient();

  const {
    data: product,
    isLoading: isProductFetchLoading,
    isSuccess: isProductFetchSuccess,
    isError: isProductFetchError,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      // #if ['products', 'customer'] exist and includes the product
      const cachedAdminProducts: Product[] | undefined = queryClient.getQueryData([
        'products',
        'customer',
      ]);
      const cachedAdminProduct = cachedAdminProducts?.find((prod) => prod._id === productId);
      if (cachedAdminProduct) return cachedAdminProduct;
      // #if ['products', 'customer'] doesn't exists
      const product: Product = await axiosInstance
        .get(`/user/get-product?id=${productId}`)
        .then((res) => res.data);
      return product;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isProductFetchLoading) return <LoadingSpinner size={8} />;
  if (isProductFetchSuccess) return <ProductOverview product={product} />;
  if (isProductFetchError)
    return (
      <div className="flex flex-col items-center">
        <p>Something went wrong!</p>
        <Link
          from="/product/$productId"
          to="/"
          className="mt-2 inline-flex min-w-28 items-center justify-center space-x-8 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Go back to Home
        </Link>
      </div>
    );
}
