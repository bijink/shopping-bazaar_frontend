import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/product/edit/$productId')({
  component: () => <div>Hello /admin/product/edit/$productId!</div>,
});
