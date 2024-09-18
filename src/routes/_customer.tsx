import { createFileRoute, Outlet } from '@tanstack/react-router';
import CartSideDrawer from '../components/CartSideDrawer';
import Footer from '../components/Footer';
import Header from '../components/Header';

export const Route = createFileRoute('/_customer')({
  component: () => (
    <>
      <Header />
      <main className="container mx-auto min-h-svh max-w-2xl px-6 pb-14 pt-5 lg:max-w-7xl lg:px-8">
        <Outlet />
      </main>
      <CartSideDrawer />
      <Footer />
    </>
  ),
});
