import {
  CartSideDrawerOpenContext,
  CartSideDrawerOpenProvider,
} from './cartSideDrawerOpen.context';
import {
  ProductQuickviewOpenContext,
  ProductQuickviewOpenProvider,
} from './productQuickviewOpen.context';

export default function ContextProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartSideDrawerOpenProvider>
      <ProductQuickviewOpenProvider>{children}</ProductQuickviewOpenProvider>
    </CartSideDrawerOpenProvider>
  );
}

export { CartSideDrawerOpenContext, ProductQuickviewOpenContext };
