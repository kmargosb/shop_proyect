'use client';

import { memo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { COUNTRIES } from '@/shared/constants/countries';
import { Input } from '@/shared/ui/input';
import { useLanguage } from '@/shared/i18n/LanguageContext';

import AddressAutocomplete from './AddressAutocomplete';
import type { CheckoutSchema } from '../schemas/checkout.schema';

type Props = {
  checkoutForm: UseFormReturn<CheckoutSchema>;
  onSubmit: () => void;
};

const CheckoutForm = memo(function CheckoutForm({ checkoutForm, onSubmit }: Props) {
  const { t } = useLanguage();

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = checkoutForm;

  return (
    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input placeholder={t.checkout.firstName} {...register('firstName')} />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <Input placeholder={t.checkout.lastName} {...register('lastName')} />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <Input type="email" placeholder="Email" {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <Input type="tel" placeholder={t.checkout.phone} {...register('phone')} />
        {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
      </div>

      <AddressAutocomplete
        value={watch('addressLine1')}
        onChange={(data) => {
          setValue('addressLine1', data.addressLine1);

          if (data.city) setValue('city', data.city);

          if (data.postalCode) setValue('postalCode', data.postalCode);

          if (data.country) setValue('country', data.country);
        }}
      />

      <Input placeholder="Door / Apartment number" {...register('addressLine2')} />

      <Input placeholder={t.checkout.city} {...register('city')} />

      <Input placeholder={t.checkout.postalCode} {...register('postalCode')} />

      <select
        {...register('country')}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 p-3"
      >
        {COUNTRIES.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
    </form>
  );
});

export default CheckoutForm;
