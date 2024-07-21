import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import PageNotFound from '../components/PageNotFound';
import Header from '../components/Header';

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      {/* <div className="flex gap-2 p-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
      </div> */}
      {/* <hr /> */}
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
  notFoundComponent: () => {
    return <PageNotFound />;
  },
});
