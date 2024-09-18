import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/24/outline';

export default function Pagination() {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 pb-10 pt-3 sm:pb-10 sm:pt-0">
      <div className="flex flex-1 justify-between sm:hidden">
        <a
          href="#"
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </a>
        <a
          href="#"
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </a>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-end sm:justify-between">
        <div>
          <a
            href="#"
            className="flex h-9 items-end border-t border-transparent pr-1 text-sm font-normal text-gray-500 hover:border-t-gray-300 hover:text-gray-700"
          >
            <ArrowLongLeftIcon aria-hidden="true" className="mr-3 h-5 w-5 text-gray-400" />
            Previous
          </a>
        </div>
        <div>
          {/*<nav aria-label="Pagination" className="isolate flex -space-x-px rounded-md">
            {[...Array(3)].map((_, index) => {
              return (
                <a
                  href="#"
                  aria-current="page"
                  className="z-10 flex h-9 items-end border-t border-transparent px-4 py-0 text-sm text-gray-500 hover:border-t-gray-300 hover:text-gray-700 focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {index + 1}
                </a>
              );
            })}
            /~ <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
              ...
            </span> ~/
          </nav>*/}
          <p className="flex h-9 items-end px-4 py-0 text-sm text-gray-700">1</p>
        </div>
        <div className="">
          <a
            href="#"
            className="flex h-9 items-end border-t border-transparent pl-1 text-sm font-normal text-gray-500 hover:border-t-gray-300 hover:text-gray-700"
          >
            Next
            <ArrowLongRightIcon aria-hidden="true" className="ml-3 h-5 w-5 text-gray-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
