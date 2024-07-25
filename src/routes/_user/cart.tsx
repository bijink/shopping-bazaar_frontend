import { createFileRoute } from '@tanstack/react-router';
import Cart from '../../components/Cart';

export const Route = createFileRoute('/_user/cart')({
  component: () => <Cart />,
});
