'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { ChangeEvent } from 'react';
import type { CheckoutFormData, Address, AddressData, CheckoutResponse } from '../types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { apiFetch } from '@/shared/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, type CheckoutSchema } from '../schemas/checkout.schema';
import {
  checkout,
  deleteAddress as deleteAddressRequest,
  fetchAddresses,
  setFavoriteAddress,
} from '../services/checkout.service';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'ES',
  });

  const checkoutForm = useForm<CheckoutSchema>({
    resolver: zodResolver(checkoutSchema),

    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      country: 'ES',
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (data: AddressData) => {
    setForm((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const deleteAddress = async (id: string) => {
    const ok = await deleteAddressRequest(id);

    if (!ok) {
      return false;
    }

    setAddresses((prev) => prev.filter((a) => a.id !== id));

    if (selectedAddressId === id) {
      setSelectedAddressId(null);
    }

    return true;
  };

  const loadAddresses = async () => {
    console.time('loadAddresses');

    try {
      const data = await fetchAddresses();

      setAddresses(data);

      if (data.length > 0) {
        const first = data[0];

        setSelectedAddressId(first.id);

        const [firstName = '', ...lastParts] = (first.fullName ?? '').split(' ');

        setForm((prev) => ({
          ...prev,
          email: user?.email || prev.email,

          firstName,
          lastName: lastParts.join(' '),

          phone: first.phone,
          addressLine1: first.addressLine1,
          addressLine2: first.addressLine2 || '',
          city: first.city,
          postalCode: first.postalCode,
          country: first.country,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          email: user?.email || prev.email,
        }));
      }

      console.timeEnd('loadAddresses');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setIsLogged(false);
      return;
    }

    setIsLogged(true);

    loadAddresses();
  }, [authLoading, user]);

  const setFavorite = async (id: string) => {
    await setFavoriteAddress(id);

    await loadAddresses();
  };

  const isValid =
    form.firstName &&
    form.lastName &&
    form.email &&
    form.phone &&
    form.addressLine1 &&
    form.city &&
    form.postalCode &&
    form.country;

  const handleSubmit = async (e: React.FormEvent, clearCart: () => void) => {
    e.preventDefault();

    if (!isValid) return alert('Please complete all required fields');

    setLoading(true);

    try {
      const res = await apiFetch('/cart/checkout', {
        method: 'POST',
        body: JSON.stringify({
          method: 'CARD',

          fullName: `${form.firstName} ${form.lastName}`.trim(),

          email: form.email,
          phone: form.phone,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        }),
      });

      if (!res) {
        throw new Error('Connection error');
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        throw new Error(data?.error || 'Unable to process checkout');
      }

      const data: CheckoutResponse = await res.json();

      localStorage.setItem('orderEmail', form.email);

      localStorage.setItem('orderEmailOrderId', data.orderId);

      window.location.href = `/orders/${data.orderId}/pay?clientSecret=${encodeURIComponent(
        data.payment.clientSecret,
      )}&email=${encodeURIComponent(form.email)}`;
    } catch (error: any) {
      toast.error(error?.message || 'Unable to process checkout');
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    isValid,
    loading,
    isLogged,
    handleSubmit,
    setIsLogged,
    showLogin,
    setShowLogin,
    setLoading,
    addresses,
    handleChange,
    handleAddressChange,
    setAddresses,
    selectedAddressId,
    deleteAddress,
    setFavorite,
    loadAddresses,
    setSelectedAddressId,
  };
}
