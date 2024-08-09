import { createFileRoute, notFound } from '@tanstack/react-router';
import ProductOverview from '../../components/ProductOverview';

export const Route = createFileRoute('/_customer/product/$productId')({
  loader: ({ params: { productId } }) => {
    if (isNaN(Number(productId))) throw notFound();
  },
  component: ProductComponent,
  notFoundComponent: () => {
    return <p>Product doesn't exist!</p>;
  },
});

function ProductComponent() {
  // const { productId } = Route.useParams();

  return <ProductOverview />;
}
