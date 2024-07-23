import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import CartSideDrawer from '../components/CartSideDrawer';
import Footer from '../components/Footer';
import Header from '../components/Header';
import PageNotFound from '../components/PageNotFound';

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <main className="container mx-auto min-h-svh">
        <Outlet />
      </main>
      <CartSideDrawer />
      <Footer />
      <TanStackRouterDevtools />
    </>
  ),
  notFoundComponent: () => <PageNotFound />,
});
