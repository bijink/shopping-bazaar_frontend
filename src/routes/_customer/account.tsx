import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_customer/account')({
  component: () => <div>Hello /account!</div>,
});
