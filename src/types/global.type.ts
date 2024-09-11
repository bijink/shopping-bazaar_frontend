export type User = {
  _id: string;
  role: string;
  fname: string;
  lname: string;
  email: string;
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
