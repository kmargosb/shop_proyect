'use client';

import { COUNTRIES } from '@/shared/constants/countries';
import { Input } from '@/shared/ui/input';
import AddressAutocomplete from './AddressAutocomplete';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import type {
  CheckoutFormData,
  CheckoutChangeHandler,
  CheckoutSubmitHandler,
  AddressData,
} from '../types';

type Props = {
  form: CheckoutFormData;
  handleChange: CheckoutChangeHandler;
  handleAddressChange: (data: AddressData) => void;
  handleSubmit: CheckoutSubmitHandler;
  clearCart: () => void;
};

export default function CheckoutForm({
  form,
  handleChange,
  handleAddressChange,
  handleSubmit,
  clearCart,
}: Props) {
  const { t } = useLanguage();

  return (
    <form id="checkout-form" onSubmit={(e) => handleSubmit(e, clearCart)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder={t.checkout.firstName}
        />

        <Input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder={t.checkout.lastName}
        />
      </div>
      <Input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <Input
        type="tel"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        placeholder={t.checkout.phone}
      />

      <AddressAutocomplete value={form.addressLine1} onChange={handleAddressChange} />

      <Input
        name="addressLine2"
        value={form.addressLine2}
        onChange={handleChange}
        placeholder="Door / Apartment number"
      />
      <Input name="city" value={form.city} onChange={handleChange} placeholder={t.checkout.city} />
      <Input
        name="postalCode"
        value={form.postalCode}
        onChange={handleChange}
        placeholder={t.checkout.postalCode}
      />

      <select
        name="country"
        value={form.country}
        onChange={handleChange}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 p-3"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </form>
  );
}
