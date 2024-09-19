import { createContext, ReactNode, useState } from 'react';

export const ToastContext = createContext<{
  triggerToast: boolean;
  setTriggerToast: React.Dispatch<React.SetStateAction<boolean>>;
  toastCount: number;
  setToastCount: React.Dispatch<React.SetStateAction<number>>;
  toastMessage: string;
  setToastMessage: React.Dispatch<React.SetStateAction<string>>;
} | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [triggerToast, setTriggerToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastCount, setToastCount] = useState(1);

  return (
    <ToastContext.Provider
      value={{
        triggerToast,
        setTriggerToast,
        toastCount,
        setToastCount,
        toastMessage,
        setToastMessage,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};
