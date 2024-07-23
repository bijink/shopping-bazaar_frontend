import { createContext, ReactNode, useState } from 'react';

export const ProductQuickviewOpenContext = createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const ProductQuickviewOpenProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <ProductQuickviewOpenContext.Provider value={{ open, setOpen }}>
      {children}
    </ProductQuickviewOpenContext.Provider>
  );
};
