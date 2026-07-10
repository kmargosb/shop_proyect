import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuth } from '@/features/auth/context/AuthContext';

import type { Address, AddressData } from '../types';
import { checkoutSchema, type CheckoutSchema } from '../schemas/checkout.schema';
import {
  fetchAddresses,
  deleteAddress as deleteAddressRequest,
  setFavoriteAddress,
} from '../services/checkout.service';

export function useCheckoutForm() {
  const { user, loading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const form = useForm<CheckoutSchema>({
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

  const { reset, setValue } = form;

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = form;

  async function loadAddresses() {
    const data = await fetchAddresses();

    setAddresses(data);

    if (!data.length) {
      setValue('email', user?.email ?? '');
      return;
    }

    const first = data[0];

    setSelectedAddressId(first.id);

    const [firstName = '', ...last] = first.fullName.split(' ');

    reset({
      firstName,
      lastName: last.join(' '),
      email: user?.email ?? '',
      phone: first.phone,
      addressLine1: first.addressLine1,
      addressLine2: first.addressLine2 ?? '',
      city: first.city,
      postalCode: first.postalCode,
      country: first.country,
    });
  }

  async function deleteAddress(id: string) {
    await deleteAddressRequest(id);

    setAddresses((prev) => prev.filter((a) => a.id !== id));

    if (selectedAddressId === id) {
      setSelectedAddressId(null);
    }
  }

  async function setFavorite(id: string) {
    await setFavoriteAddress(id);
    await loadAddresses();
  }

  function handleAddressChange(data: AddressData) {
    setValue('addressLine1', data.addressLine1);
    setValue('city', data.city);
    setValue('postalCode', data.postalCode);
    setValue('country', data.country);
  }

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsLogged(false);
      return;
    }

    setIsLogged(true);

    void loadAddresses();
  }, [authLoading, user]);

  return {
    ...form,

    errors,
    isValid,

    addresses,
    selectedAddressId,
    setSelectedAddressId,

    deleteAddress,
    setFavorite,
    handleAddressChange,
    loadAddresses,

    isLogged,
    setIsLogged,

    showLogin,
    setShowLogin,
  };
}
