import { createFileRoute, Outlet } from '@tanstack/react-router';
import AdminHeader from '../components/AdminHeader';
import Footer from '../components/Footer';
import ForbiddenPage from '../components/ForbiddenPage';
import useLocalUser from '../hooks/useLocalUser';

export const Route = createFileRoute('/admin')({
  component: AdminRootComponent,
});

function AdminRootComponent() {
  const localUser = useLocalUser();

  if (localUser?.role !== 'admin') return <ForbiddenPage />;
  return (
    <>
      <AdminHeader />
      <main className="container mx-auto min-h-svh max-w-2xl px-4 pb-14 pt-5 sm:px-6 lg:max-w-7xl lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
