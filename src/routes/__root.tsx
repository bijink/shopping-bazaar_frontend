import { createRootRoute, Outlet } from '@tanstack/react-router';
import ErrorPage from '../components/ErrorPage';
import NotFoundPage from '../components/NotFoundPage';

export const Route = createRootRoute({
  component: () => (
    <div className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Outlet />
    </div>
  ),
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});
