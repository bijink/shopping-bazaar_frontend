import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import ForbiddenPage from '../../components/ForbiddenPage';
import Orders from '../../components/Orders';
import useLocalUser from '../../hooks/useLocalUser';
import { Order } from '../../types/global.type';
import { axiosInstance } from '../../utils/axios';

export const Route = createFileRoute('/_customer/orders')({
  component: OrdersComponent,
});

function OrdersComponent() {
  const user = useLocalUser();

  const [showOrderedItems, setShowOrderedItems] = useState<{ [key: string]: boolean }>({});

  const { data: orders, isLoading: isOrdersFetchLoading } = useQuery({
    queryKey: ['orders', user?._id],
    queryFn: async () => {
      const orders = await axiosInstance
        .get(`/customer/get-orders/${user?._id}`)
        .then((res) => res.data as Order[]);
      setShowOrderedItems(
        (prev) =>
          orders.reduce(
            (acc, curr) => {
              // Keep previous state and add new keys/values
              acc[curr._id] = false; // Set the default value for each key (empty string or any other value)
              return acc;
            },
            { ...prev },
          ), // Spread previous state to retain existing keys
      );
      return orders;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!user && user.role === 'customer',
  });

  if (user?.role !== 'customer') return <ForbiddenPage />;
  return (
    <Orders
      data={{ orders, isLoading: isOrdersFetchLoading, showOrderedItems, setShowOrderedItems }}
    />
  );
}
