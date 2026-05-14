export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PROCESSING"
  | "PAID"
  | "SHIPPED"
  | "CANCELLED"
  | "FAILED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED";

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
  } | null;
  productName?: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
};

export type Shipment = {
  id: string;
  carrier: string;
  trackingNumber: string;
  status: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
};

export type Order = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postalCode: string;
  country: string;
  totalAmount: number;
  status: OrderStatus | string;
  createdAt: string;
  stripePaymentIntentId?: string | null;
  items: OrderItem[];
  invoice?: Invoice | null;
  shipment?: Shipment | null;
};
