/* eslint-disable @typescript-eslint/no-explicit-any */
interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}
interface RazorpayOptions {
  key: string;
  amount: string;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpayPaymentResponse) => Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: { [key: string]: any };
  theme?: { color?: string };
  modal?: {
    ondismiss?: () => void; // Called when the modal is closed
  };
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: (response: any) => void): void;
}
