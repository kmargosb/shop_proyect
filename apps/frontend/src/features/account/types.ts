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
