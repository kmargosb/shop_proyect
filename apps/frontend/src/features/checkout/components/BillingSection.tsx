'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { Input } from '@/shared/ui/input';
import type { UseFormReturn } from 'react-hook-form';
import type { CheckoutSchema } from '../schemas/checkout.schema';
import type { Address } from '../types';
import CheckoutSection from './sections/CheckoutSection';
import AddressFields from './AddressFields';
import SavedAddresses from './SavedAddresses';

type Props = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  checkoutForm: UseFormReturn<CheckoutSchema>;
  billingAddresses: Address[];
  selectedBillingAddressId: string | null;
  setSelectedBillingAddressId: (id: string) => void;

  setFavorite: (data: { id: string; type: 'SHIPPING' | 'BILLING' }) => Promise<void>;

  deleteAddress: (id: string) => Promise<void>;
};

export default function BillingSection({
  enabled,
  setEnabled,
  checkoutForm,
  billingAddresses,
  selectedBillingAddressId,
  setSelectedBillingAddressId,
  setFavorite,
  deleteAddress,
}: Props) {
  const { t } = useLanguage();
  const { setValue, getValues } = checkoutForm;

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
            <>
              {billingAddresses.length > 0 && (
                <SavedAddresses
                  title="Direcciones de facturación"
                  addresses={billingAddresses}
                  selectedId={selectedBillingAddressId}
                  onSelect={(addr) => {
                    setSelectedBillingAddressId(addr.id);
                    setValue('billingAddressLine1', addr.addressLine1);
                    setValue('billingAddressLine2', addr.addressLine2 ?? '');
                    setValue('billingCity', addr.city);
                    setValue('billingPostalCode', addr.postalCode);
                    setValue('billingCountry', addr.country);
                    setValue('billingCompanyName', addr.companyName ?? '');
                    setValue('billingVatNumber', addr.vatNumber ?? '');
                  }}
                  onFavorite={(id) =>
                    setFavorite({
                      id,
                      type: 'BILLING',
                    })
                  }
                  onDelete={deleteAddress}
                  isDefault={(address) => !!address.isDefaultBilling}
                />
              )}

              <div className="pt-6">
                <CheckoutSection
                  title={t.checkout.billingAddress}
                  subtitle={t.checkout.billingDescription2}
                >
                  <div className="mb-4 grid gap-3 md:grid-cols-2">
                    <Input
                      compact
                      placeholder="Company name"
                      {...checkoutForm.register('billingCompanyName')}
                    />

                    <Input
                      compact
                      placeholder="VAT / NIF"
                      {...checkoutForm.register('billingVatNumber')}
                    />
                  </div>

                  <AddressFields form={checkoutForm} prefix="billing" compact />
                </CheckoutSection>
              </div>
            </>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
