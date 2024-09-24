import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_customer/orders')({
  component: () => <div>Hello /_customer/orders!</div>,
});
