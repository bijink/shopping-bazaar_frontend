import { createFileRoute } from '@tanstack/react-router';
import ProductList from '../../components/ProductList';
import ProductQuickview from '../../components/ProductQuickview';

export const Route = createFileRoute('/_user/')({
  component: Home,
});

function Home() {
  return (
    <div className="p-2">
      <ProductList />
      <ProductQuickview />
    </div>
  );
}
