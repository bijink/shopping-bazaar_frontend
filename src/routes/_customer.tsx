import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import CartSideDrawer from '../components/CartSideDrawer';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { ToastContext } from '../contexts';

export const Route = createFileRoute('/_customer')({
  component: CustomerRootComponent,
});

function CustomerRootComponent() {
  const { triggerToast, setTriggerToast, toastCount, setToastCount, toastMessage } =
    useContext(ToastContext)!;

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
      <Header />
      <main className="container mx-auto min-h-svh max-w-2xl px-6 pb-14 pt-5 lg:max-w-7xl lg:px-8">
        <Outlet />
      </main>
      <CartSideDrawer />
      {triggerToast && <Toast message={toastMessage} closeToast={() => setTriggerToast(false)} />}
      <Footer />
    </>
  );
}
