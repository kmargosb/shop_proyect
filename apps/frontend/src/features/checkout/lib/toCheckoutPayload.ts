import type { CheckoutSchema } from '../schemas/checkout.schema';

export function mapCheckoutToApi(data: CheckoutSchema) {
  return {
    method: 'CARD',

    fullName: `${data.firstName} ${data.lastName}`.trim(),

    email: data.email,
    phone: data.phone,

    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2,
    city: data.city,
    postalCode: data.postalCode,
    country: data.country,

    billing: {
      addressLine1: data.billingAddressLine1,
      addressLine2: data.billingAddressLine2,
      city: data.billingCity,
      postalCode: data.billingPostalCode,
      country: data.billingCountry,
    },
  };
}
