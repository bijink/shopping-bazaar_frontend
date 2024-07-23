import { createContext, ReactNode, useState } from 'react';

export const CartSideDrawerOpenContext = createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const CartSideDrawerOpenProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <CartSideDrawerOpenContext.Provider value={{ open, setOpen }}>
      {children}
    </CartSideDrawerOpenContext.Provider>
  );
};
