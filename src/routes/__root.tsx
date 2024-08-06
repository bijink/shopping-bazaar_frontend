import { createRootRoute, Outlet } from '@tanstack/react-router';
import PageNotFound from '../components/PageNotFound';

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
  notFoundComponent: () => <PageNotFound />,
});
