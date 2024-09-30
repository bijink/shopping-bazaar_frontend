import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

export default function Pagination({
  limit,
  productsLength,
  page,
}: {
  limit: number;
  productsLength: number;
  page: number;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
          <button
            className="flex h-9 items-end border-t border-transparent pr-1 text-sm font-normal text-indigo-600 hover:border-t-gray-400 hover:text-indigo-800 disabled:text-gray-400 disabled:hover:border-transparent"
            onClick={() => {
              navigate({
                search: { page: isNaN(page) ? 1 : page - 1 },
              }).then(async () => {
                await queryClient.refetchQueries({
                  queryKey: ['products', 'customer'],
                  type: 'active',
                });
              });
            }}
            disabled={page <= 1}
          >
            <ArrowLongLeftIcon aria-hidden="true" className="mr-3 h-5 w-5 text-gray-400" />
            Previous
          </button>
        </div>
        <div>
          <p className="flex h-9 items-end px-4 py-0 text-sm text-gray-700">{page}</p>
        </div>
        <div className="">
          <button
            className="flex h-9 items-end border-t border-transparent pl-1 text-sm font-normal text-indigo-600 hover:border-t-gray-400 hover:text-indigo-800 disabled:text-gray-400 disabled:hover:border-transparent"
            onClick={() => {
              navigate({
                search: { page: isNaN(page) ? 1 : page + 1 },
              }).then(async () => {
                await queryClient.refetchQueries({
                  queryKey: ['products', 'customer'],
                  type: 'active',
                });
              });
            }}
            disabled={limit * page >= productsLength}
          >
            Next
            <ArrowLongRightIcon aria-hidden="true" className="ml-3 h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
