'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { CheckoutSchema } from '../schemas/checkout.schema';
import { memo, useState } from 'react';
import { Input } from '@/shared/ui/input';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import CheckoutSection from './sections/CheckoutSection';
import AddressFields from './AddressFields';
import BillingSection from './BillingSection';

type Props = {
  checkoutForm: UseFormReturn<CheckoutSchema>;
  onSubmit: () => void;
};

const CheckoutForm = memo(function CheckoutForm({ checkoutForm, onSubmit }: Props) {
  const [billingEnabled, setBillingEnabled] = useState(false);
  const { t } = useLanguage();
  const compact = true;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = checkoutForm;

  return (
    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
      <CheckoutSection title={t.checkout.contact} subtitle={t.checkout.contactDescription}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            compact={compact}
            placeholder={t.checkout.firstName}
            error={errors.firstName?.message}
            {...register('firstName')}
          />

          <Input
            compact={compact}
            placeholder={t.checkout.lastName}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          compact={compact}
          type="email"
          placeholder={t.checkout.email}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          compact={compact}
          type="tel"
          placeholder={t.checkout.phone}
          error={errors.phone?.message}
          {...register('phone')}
        />
      </CheckoutSection>

      <CheckoutSection title={t.checkout.shippingAddress} subtitle={t.checkout.shippingDescription}>
        <AddressFields form={checkoutForm} prefix="" compact={compact} />
      </CheckoutSection>

      <BillingSection
        enabled={billingEnabled}
        setEnabled={setBillingEnabled}
        checkoutForm={checkoutForm}
      />
    </form>
  );
});

export default CheckoutForm;
