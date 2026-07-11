export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_PROCESSING'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED';

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  size?: string | null;
  color?: string | null;
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

export type Refund = {
  id: string;
  status: string;
  amount: number;
  reason?: string | null;
};

export type Order = {
  id: string;
  email: string;

  shippingFullName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;

  billingFullName: string;
  billingPhone: string;
  billingAddressLine1: string;
  billingAddressLine2?: string | null;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: string;

  totalAmount: number;
  status: OrderStatus | string;
  createdAt: string;

  stripePaymentIntentId?: string | null;

  items: OrderItem[];

  invoice?: Invoice | null;
  shipment?: Shipment | null;
  refunds?: Refund[];
};
