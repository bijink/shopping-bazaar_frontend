import { createFileRoute, Link } from '@tanstack/react-router';
import ProductTable from '../../components/ProductTable';

export const Route = createFileRoute('/admin/')({
  component: () => (
    <>
      <div className="flex justify-end pb-5">
        <Link
          to="/admin/product/add"
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Add new product
        </Link>
      </div>
      <ProductTable />
    </>
  ),
});
