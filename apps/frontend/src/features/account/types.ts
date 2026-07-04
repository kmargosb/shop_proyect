export type OrderItem = {
  id: string;
  quantity: number;

  size?: string;
  color?: string;

  product?: {
    name?: string;
    images?: {
      url: string;
    }[];
  };
};

export type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
};

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};
