export type ProductImage = {
  id: string;
  url: string;
  publicId: string;
  productId: string;
  isPrimary: boolean;
};

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  images: ProductImage[];
  createdAt: string;
};