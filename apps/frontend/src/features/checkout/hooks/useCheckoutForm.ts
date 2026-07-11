import type { Address, AddressData } from '../types';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddressesQuery } from './useAddressesQuery';
import { useDeleteAddress } from './useDeleteAddress';
import { useFavoriteAddress } from './useFavoriteAddress';
import { useAuth } from '@/features/auth/context/AuthContext';
import { checkoutSchema, type CheckoutSchema } from '../schemas/checkout.schema';

export function useCheckoutForm() {
  const { user, loading: authLoading } = useAuth();
  const { data: addresses = [] } = useAddressesQuery();
  const deleteAddressMutation = useDeleteAddress();
  const favoriteAddressMutation = useFavoriteAddress();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const form = useForm<CheckoutSchema>({
    resolver: zodResolver(checkoutSchema),

    defaultValues: {
      firstName: '',
      lastName: '',
      addressLabel: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      country: 'ES',

      billingAddressLine1: '',
      billingAddressLine2: '',
      billingCity: '',
      billingPostalCode: '',
      billingCountry: '',
    },
  });

  const { reset, setValue } = form;
  useEffect(() => {
    if (!user) return;

    if (!addresses.length) {
      setValue('email', user.email ?? '');
      return;
    }

    const first = addresses.find((a) => a.isDefault) ?? addresses[0];

    setSelectedAddressId(first.id);

    const [firstName = '', ...last] = first.fullName.split(' ');

    reset({
      firstName,
      lastName: last.join(' '),
      addressLabel: first.label,
      email: user.email ?? '',
      phone: first.phone,
      addressLine1: first.addressLine1,
      addressLine2: first.addressLine2 ?? '',
      city: first.city,
      postalCode: first.postalCode,
      country: first.country,

      billingAddressLine1: '',
      billingAddressLine2: '',
      billingCity: '',
      billingPostalCode: '',
      billingCountry: '',
    });
  }, [addresses, user, reset, setValue]);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = form;

  async function deleteAddress(id: string) {
    await deleteAddressMutation.mutateAsync(id);

    if (selectedAddressId === id) {
      setSelectedAddressId(null);
    }
  }

  async function setFavorite(id: string) {
    await favoriteAddressMutation.mutateAsync(id);
  }

  function handleAddressChange(data: AddressData) {
    setValue('addressLine1', data.addressLine1);
    setValue('city', data.city);
    setValue('postalCode', data.postalCode);
    setValue('country', data.country);
  }

  useEffect(() => {
    if (authLoading) return;

    setIsLogged(!!user);
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

    isLogged,
    setIsLogged,

    showLogin,
    setShowLogin,
  };
}
