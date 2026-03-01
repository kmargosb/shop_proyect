export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
  };
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
};

export type Order = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  total: number;
  status: string;
  createdAt: string;

  items: OrderItem[];

  invoice?: Invoice | null;
};