export type ProductImage = {
  id: string;
  url: string;
  publicId: string;
  productId: string;
  isPrimary: boolean;
};

export type ProductBrand = {
  id: string;
  name: string;
  slug?: string;
};

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  reservedStock?: number;
  salesCount?: number;
  totalSold?: number;
  isActive?: boolean;
  brand?: ProductBrand | null;
  brandId?: string | null;
  category?: string;
  images: ProductImage[];
  createdAt: string;
};
