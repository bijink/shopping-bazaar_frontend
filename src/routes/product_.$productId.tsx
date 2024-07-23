import { createFileRoute, notFound } from '@tanstack/react-router';
import ProductOverview from '../components/ProductOverview';

export const Route = createFileRoute('/product/$productId')({
  loader: ({ params: { productId } }) => {
    if (isNaN(Number(productId))) throw notFound();
  },
  component: PostComponent,
  notFoundComponent: () => {
    return <p>Product doesn't exist!</p>;
  },
});

function PostComponent() {
  // const { productId } = Route.useParams();

  return <ProductOverview />;
}
