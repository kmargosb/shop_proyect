import { z } from 'zod';

export const checkoutSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  addressLabel: z.string().optional(),

  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),

  billingAddressLine1: z.string().optional(),
  billingAddressLine2: z.string().optional(),
  billingCity: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingCountry: z.string().optional(),
  billingCompanyName: z.string().optional(),
  billingVatNumber: z.string().optional(),
});

export type CheckoutSchema = z.infer<typeof checkoutSchema>;
