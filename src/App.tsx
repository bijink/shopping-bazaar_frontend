import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools as TanStackQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import React, { Suspense } from 'react';
import ContextProviders from './contexts';
import { routeTree } from './routeTree.gen';

// Create a query client
const queryClient = new QueryClient();
// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : React.lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ContextProviders>
        <RouterProvider router={router} />
        <Suspense>
          <TanStackRouterDevtools router={router} />
        </Suspense>
        <TanStackQueryDevtools />
      </ContextProviders>
    </QueryClientProvider>
  );
}
