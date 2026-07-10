import { z } from 'zod';

export const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),

  lastName: z.string().min(1, 'Last name is required'),

  email: z.string().email(),

  phone: z.string().min(5),

  addressLine1: z.string().min(1),

  addressLine2: z.string().optional(),

  city: z.string().min(1),

  postalCode: z.string().min(1),

  country: z.string().min(1),
});

export type CheckoutSchema = z.infer<typeof checkoutSchema>;
