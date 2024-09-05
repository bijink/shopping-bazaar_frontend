import { createFileRoute, Outlet } from '@tanstack/react-router';
import Header from '../components/Header';
import NotFoundPage from '../components/NotFoundPage';

export const Route = createFileRoute('/_auth')({
  component: () => (
    <>
      <Header noSearch noAdminKey noCart noAccount />
      <Outlet />
    </>
  ),
  notFoundComponent: NotFoundPage,
});
