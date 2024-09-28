import { createFileRoute, Outlet } from '@tanstack/react-router';
import ForbiddenPage from '../components/ForbiddenPage';
import Header from '../components/Header';
import NotFoundPage from '../components/NotFoundPage';
import useLocalUser from '../hooks/useLocalUser';

export const Route = createFileRoute('/_auth')({
  component: AuthRootComponent,
  notFoundComponent: NotFoundPage,
});

function AuthRootComponent() {
  const user = useLocalUser();

  if (user) return <ForbiddenPage />;
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
