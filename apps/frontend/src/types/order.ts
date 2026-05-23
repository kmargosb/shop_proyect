export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PROCESSING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"

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

export type RefundEvidence = { id?: string; url: string; publicId?: string | null };

export type RefundItem = { orderItemId: string; quantity: number };

export type Refund = {
  id: string;
  status: "PENDING_REVIEW" | "SUCCEEDED" | "REJECTED" | string;
  amount: number;
  reason?: string | null;
  note?: string | null;
  rejectionReason?: string | null;
  items?: RefundItem[];
  evidence?: RefundEvidence[];
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
  status: OrderStatus | string ;
  createdAt: string;
  stripePaymentIntentId?: string | null;
  items: OrderItem[];
  invoice?: Invoice | null;
  shipment?: Shipment | null;
  refunds?: Refund[];
};
