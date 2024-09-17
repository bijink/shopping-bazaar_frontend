import { QueryClient, queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import PageLoadingIndicator from '../../components/PageLoadingIndicator';
import ProductList from '../../components/ProductList';
import ProductQuickview from '../../components/ProductQuickview';
import { Product, ProductWithBase64Image } from '../../types/global.type';
import { axiosInstance } from '../../utils/axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});
const productsQueryOptions = queryOptions({
  queryKey: ['products'],
  queryFn: async () => {
    const cachedProducts: ProductWithBase64Image[] | undefined = queryClient.getQueryData([
      'products',
    ]);
    if (cachedProducts) return cachedProducts;

    const products: Product[] = await axiosInstance
      .get('/user/get-all-product')
      .then((res) => res.data);
    const updatedProducts: ProductWithBase64Image[] = await Promise.all(
      products.map(async (prod: Product) => {
        const images = await axiosInstance
          .post('/get-multi-images', { images: prod.images }, { timeout: 90000 })
          .then((res) => res.data.images);
        return { ...prod, images }; // return the product with updated images
      }),
    );
    return updatedProducts; // return products with images data
  },
});

export const Route = createFileRoute('/_customer/')({
  loader: () => queryClient.ensureQueryData(productsQueryOptions),
  pendingComponent: PageLoadingIndicator,
  pendingMinMs: 2000,
  component: HomeComponent,
});

function HomeComponent() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);

  return (
    <div className="p-2">
      <ProductList products={products} />
      <ProductQuickview />
    </div>
  );
}
