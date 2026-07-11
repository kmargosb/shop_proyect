export type Address = {
  id: string;
  type: 'SHIPPING' | 'BILLING';
  label: string;
  fullName: string;
  phone?: string;
  companyName?: string | null;
  vatNumber?: string | null;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
};

export type AddressData = {
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
};

export type CheckoutResponse = {
  orderId: string;
  payment: {
    clientSecret: string;
  };
};

export type CheckoutFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
};

export type CheckoutAddress = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
};

export type CheckoutInput = {
  cartId: string;
  method: string;

  userId?: string;

  fullName: string;
  email: string;
  phone: string;

  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;

  billingAddress?: CheckoutAddress;
};

export type CheckoutChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
) => void;

export type CheckoutSubmitHandler = (e: React.FormEvent, clearCart: () => void) => Promise<void>;
