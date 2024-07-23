{
  /* Heads up! 👋

  Plugins:
    - @tailwindcss/forms
*/
}

const CartListItem = () => (
  <div className="justify-between border-b-[1px] border-b-gray-200 py-10 sm:flex sm:justify-start">
    <img
      src="https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1131&q=80"
      alt="product-image"
      className="w-full rounded-md sm:h-48 sm:w-44"
    />
    <div className="sm:ml-4 sm:flex sm:w-full sm:justify-between">
      <div className="mt-5 sm:mt-0">
        <h2 className="text-lg font-bold text-gray-900">Nike Air Max 2019</h2>
        <p className="mt-1 text-xs text-gray-700">36EU - 4US</p>
      </div>
      <div className="im mt-4 flex justify-between sm:mt-0 sm:block sm:space-x-6 sm:space-y-6">
        <div className="flex items-center border-gray-100">
          <span className="cursor-pointer rounded-l bg-gray-100 px-3.5 py-1 duration-100 hover:bg-blue-500 hover:text-blue-50">
            {' '}
            -{' '}
          </span>
          <input
            className="h-8 w-8 border bg-white text-center text-xs outline-none"
            type="number"
            value="2"
            min="1"
          />
          <span className="cursor-pointer rounded-r bg-gray-100 px-3 py-1 duration-100 hover:bg-blue-500 hover:text-blue-50">
            {' '}
            +{' '}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-sm">259.000 ₭</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="h-5 w-5 cursor-pointer duration-150 hover:text-red-500"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

export default function Cart() {
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
              <CartListItem />
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
