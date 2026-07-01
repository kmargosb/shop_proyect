'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { contactApi } from '../api/contact.api';
import { contactSchema, ContactFormData } from '../schemas/contact.schema';

export function useContactForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),

    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      website: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);

    try {
      const res = await contactApi.send(values);

      if (!res) {
        throw new Error('Connection error');
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        if (res.status === 429 && data?.retryAfter) {
          const minutes = Math.ceil(data.retryAfter / 60);

          toast.error(
            `Too many messages sent. Please wait ${minutes} minute${minutes > 1 ? 's' : ''}.`,
          );

          return;
        }

        throw new Error(data?.message || 'Something went wrong.');
      }

      form.reset();

      toast.success("Message sent successfully. We'll get back to you soon.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong. Please try again later.',
      );
    }
  });

  return {
    form,
    loading,
    onSubmit,
  };
}
