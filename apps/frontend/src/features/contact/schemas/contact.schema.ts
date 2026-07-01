import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(80),

  email: z.string().trim().email('Please enter a valid email address.'),

  subject: z.string().trim().min(3, 'Please enter a subject.').max(120),

  message: z.string().trim().min(20, 'Please write at least 20 characters.').max(2000),

  // Honeypot (debe permanecer vacío)
  website: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
