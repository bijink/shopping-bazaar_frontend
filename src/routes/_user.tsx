import { createFileRoute, Outlet } from '@tanstack/react-router';
import CartSideDrawer from '../components/CartSideDrawer';
import Footer from '../components/Footer';
import Header from '../components/Header';

export const Route = createFileRoute('/_user')({
  component: () => (
    <>
      <Header />
      <main className="container mx-auto min-h-svh">
        <Outlet />
      </main>
      <CartSideDrawer />
      <Footer />
    </>
  ),
});
