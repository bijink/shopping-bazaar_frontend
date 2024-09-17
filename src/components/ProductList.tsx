import { Link } from '@tanstack/react-router';
import { useContext } from 'react';
import { ProductQuickviewOpenContext } from '../contexts';
import { ProductWithBase64Image } from '../types/global.type';
import Pagination from './Pagination';

export default function ProductList({ products }: { products: ProductWithBase64Image[] }) {
  const { setOpen } = useContext(ProductQuickviewOpenContext)!;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 py-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((prod) => (
            <div key={prod._id} className="group">
              <Link to="/product/$productId" params={{ productId: prod._id as string }}>
                <div className="aspect-w-1 xl:aspect-w-7 relative h-[40rem] w-full overflow-hidden rounded-lg bg-gray-200 sm:h-[20rem]">
                  <img
                    src={`data:image/${prod.images[0].mimeType};base64,${prod.images[0].data}`}
                    alt={`product-${prod.name}`}
                    className="h-full w-full object-cover object-center group-hover:opacity-75"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(true);
                    }}
                    className="absolute bottom-0 left-0 mb-[5%] ml-[10%] w-[80%] rounded-md bg-white bg-opacity-75 px-4 py-2 text-sm text-gray-800 opacity-0 group-hover:opacity-100"
                  >
                    Quick View
                  </button>
                </div>
                <div className="mt-4 sm:hidden">
                  <h3 className="text-sm text-gray-700">{prod.name}</h3>
                  <p className="mt-1 text-lg font-medium text-gray-900">{prod.price}</p>
                </div>
                <div className="mt-4 hidden justify-between sm:flex">
                  <div>
                    <h3 className="text-sm text-gray-700">{prod.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{prod.category}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{prod.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
        <Pagination />
      </div>
    </div>
  );
}
