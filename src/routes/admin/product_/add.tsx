import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/product/add')({
  component: () => <div>Hello /admin/product/add!</div>,
});
