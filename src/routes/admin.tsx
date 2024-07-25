import { createFileRoute, Outlet } from '@tanstack/react-router';
import Footer from '../components/Footer';

export const Route = createFileRoute('/admin')({
  component: () => (
    <>
      <h1 className="text-4xl">Admin routes</h1>
      <main className="container mx-auto min-h-svh">
        <Outlet />
      </main>
      <Footer />
    </>
  ),
});
