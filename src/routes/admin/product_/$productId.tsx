import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ProductOverview from '../../../components/ProductOverview';
import { Base64Image, Product, ProductWithBase64Image } from '../../../types/global.type';
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
    isSuccess: isProductFetchSuccess,
    isError: isProductFetchError,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      // #if ['products', 'admin'] exist and includes the product
      const cachedAdminProducts: Product[] | undefined = queryClient.getQueryData([
        'products',
        'admin',
      ]);
      const cachedAdminProduct: Product | undefined = cachedAdminProducts?.find(
        (prod) => prod._id === productId,
      );
      if (cachedAdminProduct) {
        const imagesForCachedAdminProduct: Base64Image[] = await axiosInstance
          .post('/get-multi-images', { images: cachedAdminProduct.images }, { timeout: 90000 })
          .then((res) => res.data.images);
        const updatedCachedAdminProduct: ProductWithBase64Image = {
          ...cachedAdminProduct,
          images: imagesForCachedAdminProduct,
        };
        return updatedCachedAdminProduct;
      }
      // #if ['products', 'admin'] doesn't exists
      const product: Product = await axiosInstance
        .get(`/user/get-product?id=${productId}`)
        .then((res) => res.data);
      const imagesForProduct: Base64Image[] = await axiosInstance
        .post('/get-multi-images', { images: product.images }, { timeout: 90000 })
        .then((res) => res.data.images);
      const updatedProduct: ProductWithBase64Image = { ...product, images: imagesForProduct };
      return updatedProduct;
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
          from="/admin/product/$productId"
          to="/admin"
          className="mt-2 inline-flex min-w-28 items-center justify-center space-x-8 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Go to Admin Home
        </Link>
      </div>
    );
}
