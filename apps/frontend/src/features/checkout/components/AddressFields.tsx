'use client';

import { COUNTRIES } from '@/shared/constants/countries';
import { Input } from '@/shared/ui/input';
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

import AddressAutocomplete from './AddressAutocomplete';

type Props<T extends FieldValues> = {
  form: UseFormReturn<T>;
  prefix: string;
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

  const field = (name: string) => `${prefix}${name}` as FieldPath<T>;

  return (
    <>
      <AddressAutocomplete
        value={watch(field('AddressLine1')) as string}
        onChange={(data) => {
          setValue(field('AddressLine1'), data.addressLine1 as any);

          if (data.city) setValue(field('City'), data.city as any);

          if (data.postalCode) setValue(field('PostalCode'), data.postalCode as any);

          if (data.country) setValue(field('Country'), data.country as any);
        }}
      />

      <Input compact={compact} placeholder="Apartment" {...register(field('AddressLine2'))} />

      <div className="grid gap-3 md:grid-cols-2">
        <Input
          compact={compact}
          placeholder="City"
          error={(errors as any)[`${prefix}City`]?.message}
          {...register(field('City'))}
        />

        <Input
          compact={compact}
          placeholder="ZIP Code"
          error={(errors as any)[`${prefix}PostalCode`]?.message}
          {...register(field('PostalCode'))}
        />
      </div>

      <select
        {...register(field('Country'))}
        className="h-11 w-full rounded-xl border border-white/10 bg-neutral-950 px-4 md:h-12"
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
