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

  items: {
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
  }[];
};

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

  isDefault?: boolean;
};

export type AddressPayload = {
  type: 'SHIPPING' | 'BILLING';

  label: string;

  fullName: string;
  phone: string;

  companyName?: string;
  vatNumber?: string;

  addressLine1: string;
  addressLine2?: string;

  city: string;
  postalCode: string;
  country: string;
};
