export type CheckoutInput = {
  cartId: string;
  method: string;

  userId?: string;

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
