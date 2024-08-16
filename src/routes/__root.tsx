import { createRootRoute, Outlet } from '@tanstack/react-router';
import NotFoundPage from '../components/NotFoundPage';

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
  notFoundComponent: () => <NotFoundPage />,
});
