import { createFileRoute, Outlet } from '@tanstack/react-router';
import AdminHeader from '../components/AdminHeader';
import Footer from '../components/Footer';

export const Route = createFileRoute('/admin')({
  component: () => (
    <>
      <AdminHeader />
      <main className="container mx-auto min-h-svh max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </>
  ),
});
