import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_user/account')({
  component: () => <div>Hello /account!</div>,
});
