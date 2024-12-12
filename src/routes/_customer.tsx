import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import CartSideDrawer from '../components/CartSideDrawer';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { ToastContext } from '../contexts';
import useLocalUser from '../hooks/useLocalUser';
import { CartItem } from '../types/global.type';
import { axiosInstance } from '../utils/axios';

export const Route = createFileRoute('/_customer')({
  component: CustomerRootComponent,
});

function CustomerRootComponent() {
  const user = useLocalUser();
  const { triggerToast, setTriggerToast, toastCount, setToastCount, toastMessage } =
    useContext(ToastContext)!;

  const { data: cartItems } = useQuery({
    queryKey: ['cart', user?._id],
    queryFn: async () => {
      const cartItems: CartItem[] = await axiosInstance
        .get(`/customer/get-cart-items/${user?._id}`)
        .then((res) => res.data.items);
      if (!cartItems) return null;
      return cartItems;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!user && user.role === 'customer',
  });

  useEffect(() => {
    const toastTimeout = setTimeout(() => {
      setTriggerToast(false);
      setToastCount(1);
    }, 4000);
    if (!triggerToast) {
      clearTimeout(toastTimeout);
      setToastCount(1);
    }
    return () => {
      clearTimeout(toastTimeout);
    };
  }, [triggerToast, setTriggerToast, toastCount, setToastCount]);

  return (
    <>
      <Header cartCount={cartItems?.length || 0} />
      <main className="container mx-auto min-h-svh max-w-2xl px-6 pb-14 pt-5 lg:max-w-7xl lg:px-8">
        <Outlet />
      </main>
      <CartSideDrawer items={cartItems || []} />
      {triggerToast && <Toast message={toastMessage} closeToast={() => setTriggerToast(false)} />}
      <Footer />
    </>
  );
}
