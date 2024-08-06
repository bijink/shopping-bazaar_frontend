import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools as TanStackQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ContextProviders>
        <RouterProvider router={router} />
        <TanStackRouterDevtools router={router} />
        <TanStackQueryDevtools />
      </ContextProviders>
    </QueryClientProvider>
  );
}
