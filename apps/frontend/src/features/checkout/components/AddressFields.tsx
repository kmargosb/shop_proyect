'use client';

import { COUNTRIES } from '@/shared/constants/countries';
import { Input } from '@/shared/ui/input';
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

import AddressAutocomplete from './AddressAutocomplete';

type Props<T extends FieldValues> = {
  form: UseFormReturn<T>;
  prefix: '' | 'billing';
  compact?: boolean;
};

export default function AddressFields<T extends FieldValues>({
  form,
  prefix,
  compact = true,
}: Props<T>) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const field = (name: 'addressLine1' | 'addressLine2' | 'city' | 'postalCode' | 'country') =>
    (prefix ? `${prefix}${name.charAt(0).toUpperCase()}${name.slice(1)}` : name) as FieldPath<T>;

  const error = (name: 'addressLine1' | 'addressLine2' | 'city' | 'postalCode' | 'country') =>
    (errors as Record<string, { message?: string }>)[field(name)]?.message;

  return (
    <>
      <AddressAutocomplete
        value={(watch(field('addressLine1')) as string) ?? ''}
        onChange={(data) => {
          setValue(field('addressLine1'), data.addressLine1 as never);

          if (data.city) {
            setValue(field('city'), data.city as never);
          }

          if (data.postalCode) {
            setValue(field('postalCode'), data.postalCode as never);
          }

          if (data.country) {
            setValue(field('country'), data.country as never);
          }
        }}
      />

      <Input compact={compact} placeholder="Apartment" {...register(field('addressLine2'))} />

      <div className="grid gap-3 md:grid-cols-2">
        <Input
          compact={compact}
          placeholder="City"
          error={error('city')}
          {...register(field('city'))}
        />

        <Input
          compact={compact}
          placeholder="ZIP Code"
          error={error('postalCode')}
          {...register(field('postalCode'))}
        />
      </div>

      <select
        {...register(field('country'))}
        className="h-11 w-full rounded-xl border border-white/10 bg-neutral-950 px-4 text-sm md:h-12"
      >
        {COUNTRIES.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
    </>
  );
}
