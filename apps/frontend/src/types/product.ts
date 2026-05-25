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

export type ProductVariant = {
  id?: string;
  size: string;
  color: string;
  stock: number;
  reservedStock?: number;
  sku?: string;
};

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  totalStock?: number;
  salesCount?: number;
  totalSold?: number;
  isActive?: boolean;
  gender?: string;
  brand?: ProductBrand | null;
  brandId?: string | null;
  category?: string;
  images: ProductImage[];
  variants?: ProductVariant[];
  createdAt: string;
};
