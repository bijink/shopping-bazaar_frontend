import { createFileRoute } from '@tanstack/react-router';
import ProductAddForm from '../../../components/ProductAddForm';

export const Route = createFileRoute('/admin/product/add')({
  component: () => (
    <div className="py-16">
      <ProductAddForm />
    </div>
  ),
});
