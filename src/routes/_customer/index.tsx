import { QueryClient, queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import PageLoadingIndicator from '../../components/PageLoadingIndicator';
import Pagination from '../../components/Pagination';
import ProductCard from '../../components/ProductCard';
import ProductQuickview from '../../components/ProductQuickview';
import { Product } from '../../types/global.type';
import { axiosInstance } from '../../utils/axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});
const limit = 8;
const productsQueryOptions = (page = 1) => {
  return queryOptions({
    queryKey: ['products', 'customer', page],
    queryFn: async () => {
      const productsData: { products: Product[]; length: number } = await axiosInstance
        .get(`/user/get-all-product?sort=desc&skip=${page * limit - limit}&limit=${limit}`)
        .then((res) => res.data);
      return { products: productsData.products, length: productsData.length };
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const Route = createFileRoute('/_customer/')({
  loaderDeps: ({ search: { page } }: { search: { page: number } }) => ({
    page: isNaN(page) ? 1 : page,
  }),
  loader: ({ deps: { page } }) => queryClient.ensureQueryData(productsQueryOptions(page)),
  pendingComponent: PageLoadingIndicator,
  pendingMinMs: 2000,
  component: HomeComponent,
  staleTime: 5_000,
});

function HomeComponent() {
  const page = useSearch({
    from: '/_customer/',
    select: (search: { page: number }) => (isNaN(search.page) ? 1 : search.page),
  });
  const {
    data: { products, length },
  } = useSuspenseQuery(productsQueryOptions(page));

  const [quickviewProduct, setQuickviewProduct] = useState({} as Product);

  return (
    <>
      {products.length ? (
        <>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 py-8 sm:grid-cols-2 sm:py-12 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {products.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                setQuickviewProduct={setQuickviewProduct}
              />
            ))}
          </div>
          <Pagination limit={limit} productsLength={length} page={page} />
        </>
      ) : (
        <div className="h-screen">
          <div className="flex items-center justify-center">Product list is empty</div>
        </div>
      )}
      {!!Object.keys(quickviewProduct).length && <ProductQuickview product={quickviewProduct} />}
    </>
  );
}
