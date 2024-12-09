export type User = {
  _id: string;
  role: string;
  fname: string;
  lname: string;
  email: string;
  image?: string;
  address?: UserAddress;
  mobile?: string;
};

export interface Product {
  _id?: string;
  name: string;
  suitableFor: string[];
  category: string;
  sizes: {
    xxs: boolean;
    xs: boolean;
    s: boolean;
    m: boolean;
    l: boolean;
    xl: boolean;
    '2xl': boolean;
    '3xl': boolean;
  };
  price: number;
  colors: { name: string; hex: string }[];
  description: string;
  details: string;
  highlights: string[];
  images?: string[];
}
export interface Base64Image {
  name: string;
  data: string;
  mimeType: string;
}
export interface ProductWithBase64Image extends Omit<Product, 'images'> {
  images: Base64Image[];
}

export interface CartItem {
  _id?: string;
  product_id: string;
  name: string;
  suitableFor: string[];
  category: string;
  price: number;
  description: string;
  details: string;
  highlights: string[];
  size: string;
  color: { name: string; hex: string };
  images: string[];
  quantity: number;
}
export interface CartItemWithBase64Image extends Omit<CartItem, 'image'> {
  image: Base64Image;
}

interface OrderedItem {
  _id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  color: {
    name: string;
    hex: string;
  };
  size: string;
  image: string;
}
export interface Order {
  _id: string;
  date: string;
  user_id: string;
  deliveryDetails: {
    address: UserAddress;
    mobile: string;
  };
  orderedItems: OrderedItem[];
  totalAmount: number;
  paymentMethod: string;
  orderStatus: string;
  paymentStatus: string;
  deliveryStatus: string;
}

export type UserAddress = {
  fullname: string;
  building: string;
  street: string;
  town: string;
  state: string;
  pincode: string;
  landmark: string;
};
