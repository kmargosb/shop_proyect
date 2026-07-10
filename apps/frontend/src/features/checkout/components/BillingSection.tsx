'use client';

import { AnimatePresence, motion } from 'framer-motion';
import CheckoutSection from './sections/CheckoutSection';
import AddressFields from './AddressFields';
import type { UseFormReturn } from 'react-hook-form';
import type { CheckoutSchema } from '../schemas/checkout.schema';
import { useLanguage } from '@/shared/i18n/LanguageContext';

type Props = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  checkoutForm: UseFormReturn<CheckoutSchema>;
};

export default function BillingSection({ enabled, setEnabled, checkoutForm }: Props) {
  const { t } = useLanguage();

  return (
    <>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-neutral-900 p-4">
        <input
          type="checkbox"
          checked={!enabled}
          onChange={(e) => setEnabled(!e.target.checked)}
          className="h-4 w-4"
        />

        <span className="text-sm">{t.checkout.sameBillingAddress}</span>
      </label>

      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <CheckoutSection
              title={t.checkout.billingAddress}
              subtitle={t.checkout.billingDescription2}
            >
              <AddressFields form={checkoutForm} prefix="billing" compact />
            </CheckoutSection>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
