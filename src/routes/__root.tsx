import { createRootRoute, Outlet } from '@tanstack/react-router';
import ErrorPage from '../components/ErrorPage';
import NotFoundPage from '../components/NotFoundPage';

export const Route = createRootRoute({
  component: Outlet,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});
