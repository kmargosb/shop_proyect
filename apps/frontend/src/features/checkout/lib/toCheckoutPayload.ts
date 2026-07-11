import type { CheckoutSchema } from '../schemas/checkout.schema';

export function mapCheckoutToApi(data: CheckoutSchema) {
  const shippingFullName = `${data.firstName} ${data.lastName}`.trim();

  const useShippingAsBilling =
    !data.billingAddressLine1 &&
    !data.billingCity &&
    !data.billingPostalCode &&
    !data.billingCountry;

  return {
    method: 'CARD',

    email: data.email,
    label: data.addressLabel,

    shippingFullName,
    shippingPhone: data.phone,
    shippingAddressLine1: data.addressLine1,
    shippingAddressLine2: data.addressLine2,
    shippingCity: data.city,
    shippingPostalCode: data.postalCode,
    shippingCountry: data.country,

    billingFullName: shippingFullName,
    billingPhone: data.phone,
    billingAddressLine1: useShippingAsBilling ? data.addressLine1 : data.billingAddressLine1,
    billingAddressLine2: useShippingAsBilling ? data.addressLine2 : data.billingAddressLine2,
    billingCity: useShippingAsBilling ? data.city : data.billingCity,
    billingPostalCode: useShippingAsBilling ? data.postalCode : data.billingPostalCode,
    billingCountry: useShippingAsBilling ? data.country : data.billingCountry,
  };
}
