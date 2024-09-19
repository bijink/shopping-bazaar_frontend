import { QueryClient, queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import PageLoadingIndicator from '../../components/PageLoadingIndicator';
import Pagination from '../../components/Pagination';
import ProductQuickview from '../../components/ProductQuickview';
import { ProductQuickviewOpenContext } from '../../contexts';
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
  queryKey: ['products', 'customer'],
  queryFn: async () => {
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
  staleTime: 1000 * 60 * 5,
});

export const Route = createFileRoute('/_customer/')({
  loader: () => queryClient.ensureQueryData(productsQueryOptions),
  pendingComponent: PageLoadingIndicator,
  pendingMinMs: 2000,
  component: HomeComponent,
});

function HomeComponent() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const { setOpen } = useContext(ProductQuickviewOpenContext)!;

  const [quickviewProduct, setQuickviewProduct] = useState({} as ProductWithBase64Image);

  return (
    <>
      {products.length ? (
        <>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 py-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {[...products]?.reverse()?.map((prod) => (
              <div key={prod._id} className="group">
                <Link from="/" to="/product/$productId" params={{ productId: prod._id as string }}>
                  <div className="aspect-w-1 xl:aspect-w-7 relative h-[40rem] w-full overflow-hidden rounded-lg bg-gray-200 sm:h-[20rem]">
                    <img
                      src={`data:${prod.images[0].mimeType};base64,${prod.images[0].data}`}
                      alt={`product-${prod.name}`}
                      className="h-full w-full object-cover object-center group-hover:opacity-75"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setQuickviewProduct(prod);
                        setOpen(true);
                      }}
                      className="absolute bottom-0 left-0 mb-[5%] ml-[10%] w-[80%] rounded-md bg-white bg-opacity-75 px-4 py-2 text-sm text-gray-800 opacity-0 group-hover:opacity-100"
                    >
                      Quick View
                    </button>
                  </div>
                  <div className="mt-4 sm:hidden">
                    <h3 className="text-sm text-gray-700">{prod.name}</h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      <span>&#8377;</span>
                      {prod.price}
                    </p>
                  </div>
                  <div className="mt-4 hidden justify-between sm:flex">
                    <div>
                      <h3 className="text-sm text-gray-700">{prod.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{prod.category}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      <span>&#8377;</span>
                      {prod.price}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <Pagination />
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
