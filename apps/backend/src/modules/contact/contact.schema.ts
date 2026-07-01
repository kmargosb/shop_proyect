import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),

  email: z.string().trim().email(),

  subject: z.string().trim().min(3).max(120),

  message: z.string().trim().min(20).max(2000),

  website: z.string().optional(), // honeypot
});

export type ContactInput = z.infer<typeof contactSchema>;
