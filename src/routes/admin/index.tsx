import {
  QueryClient,
  queryOptions,
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import PageLoadingIndicator from '../../components/PageLoadingIndicator';
import { CustomHistoryState } from '../../types/global.type';
import { axiosInstance } from '../../utils/axios';

type ProductType = {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});
const productsQueryOptions = queryOptions({
  queryKey: ['admin-products'],
  queryFn: () => axiosInstance.get('/admin/get-all-product').then((res) => res.data),
});

export const Route = createFileRoute('/admin/')({
  // Use the `loader` option to ensure that the data is loaded
  loader: () => queryClient.ensureQueryData(productsQueryOptions),
  pendingComponent: PageLoadingIndicator,
  pendingMinMs: 2000,
  errorComponent: AdminHomeErrorComponent,
  component: AdminHomeComponent,
});

function AdminHomeErrorComponent({ error }: { error: Error }) {
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();

  useEffect(() => {
    // Reset the query error boundary
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  return (
    <div className="flex flex-col items-center">
      {error.message}
      <button
        className="mt-2 inline-flex min-w-28 items-center justify-center space-x-8 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        onClick={() => {
          // Invalidate the route to reload the loader, and reset any router error boundaries
          router.invalidate();
        }}
      >
        Retry
      </button>
    </div>
  );
}

function AdminHomeComponent() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  // console.log({ products });
  const navigate = useNavigate({ from: '/admin/' });

  return (
    <>
      <div className="flex justify-between pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black">Products</h2>
        </div>
        <Link
          to="/admin/product/add"
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Add new product
        </Link>
      </div>
      {products.length ? (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Product name
                </th>
                <th scope="col" className="px-6 py-3">
                  Product id
                </th>
                <th scope="col" className="px-6 py-3">
                  Color
                </th>
                <th scope="col" className="px-6 py-3">
                  Category
                </th>
                <th scope="col" className="px-6 py-3">
                  Price
                </th>
                <th scope="col" className="px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products?.map((prod: ProductType) => (
                <tr
                  key={prod._id}
                  className="cursor-pointer border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                  >
                    {prod.name}
                  </th>
                  <td className="px-6 py-4">{prod._id}</td>
                  <td className="px-6 py-4">Silver</td>
                  <td className="px-6 py-4">{prod.category}</td>
                  <td className="px-6 py-4">{prod.price}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to="/admin/product/$productId"
                      params={{ productId: prod._id }}
                      state={{ product: prod } as CustomHistoryState}
                      className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-screen">
          <div className="flex items-center justify-center">Product list is empty</div>
        </div>
      )}
    </>
  );
}
