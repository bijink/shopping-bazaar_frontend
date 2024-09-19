import {
  CartSideDrawerOpenContext,
  CartSideDrawerOpenProvider,
} from './cartSideDrawerOpen.context';
import {
  ProductQuickviewOpenContext,
  ProductQuickviewOpenProvider,
} from './productQuickviewOpen.context';
import { ToastContext, ToastProvider } from './toast.context';

export default function ContextProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartSideDrawerOpenProvider>
      <ProductQuickviewOpenProvider>
        <ToastProvider>{children}</ToastProvider>
      </ProductQuickviewOpenProvider>
    </CartSideDrawerOpenProvider>
  );
}

export { CartSideDrawerOpenContext, ProductQuickviewOpenContext, ToastContext };
