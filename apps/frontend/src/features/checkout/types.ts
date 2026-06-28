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

export type CheckoutChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
) => void;

export type CheckoutSubmitHandler = (e: React.FormEvent, clearCart: () => void) => Promise<void>;
