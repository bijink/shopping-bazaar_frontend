import { createFileRoute } from '@tanstack/react-router';
import CartItem from '../../components/CartItem';

export const Route = createFileRoute('/_customer/cart')({
  component: CartComponent,
});

function CartComponent() {
  return (
    <section>
      <div className="px-8 pb-16 pt-12">
        <h1 className="mx-auto mb-10 max-w-2xl px-4 text-2xl font-bold tracking-tight text-gray-900 sm:px-6 sm:text-3xl lg:max-w-7xl lg:px-8">
          Cart Items
        </h1>
        <div className="mx-auto max-w-2xl justify-center px-4 sm:px-6 md:flex md:space-x-12 lg:max-w-7xl lg:px-8">
          {/* Cart list item */}
          <div className="border-t-[1px] border-t-gray-200 md:w-2/3">
            {[...Array(10)].map(() => (
              <CartItem />
            ))}
          </div>
          <div className="sticky top-10 mt-6 h-full rounded-lg bg-gray-50 p-6 md:mt-0 md:w-1/3">
            <div className="mb-2 flex justify-between">
              <p className="text-gray-700">Subtotal</p>
              <p className="text-gray-700">$129.99</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-700">Shipping</p>
              <p className="text-gray-700">$4.99</p>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between">
              <p className="text-lg font-bold">Total</p>
              <div className="">
                <p className="mb-1 text-lg font-bold">$134.98 USD</p>
                <p className="text-sm text-gray-700">including VAT</p>
              </div>
            </div>
            {/* <button className="mt-6 w-full rounded-md bg-blue-500 py-1.5 font-medium text-blue-50 hover:bg-blue-600">
              Check out
            </button> */}
            <div className="mt-6">
              <a
                href="#"
                className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Checkout
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
