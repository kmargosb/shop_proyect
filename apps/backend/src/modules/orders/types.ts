export type CreateOrderInput = {
  userId?: string;
  label?: string;

  items: {
    productId: string;
    variantId?: string;
    quantity: number;

    productName: string;
    productPrice: number;

    sku?: string | null;

    size?: unknown;
    color?: unknown;
  }[];

  email: string;

  shippingFullName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;

  billingFullName: string;
  billingPhone: string;
  billingAddressLine1: string;
  billingAddressLine2?: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: string;
};
