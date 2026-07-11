'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCheckoutController } from './hooks/useCheckoutController';
import { useCart } from '@/features/cart/CartContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import LoginInline from '@/features/auth/components/LoginInline';
import CheckoutSummary from './components/CheckoutSummary';
import CheckoutForm from './components/CheckoutForm';
import SavedAddresses from './components/SavedAddresses';

export default function CreateOrderForm() {
  const { items, totalPrice, increaseQuantity, decreaseQuantity, removeItem } = useCart();
  const [showAddresses, setShowAddresses] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const { refreshUser } = useAuth();
  const { t } = useLanguage();
  const {
    checkoutForm,
    submit,
    loading,
    addresses,
    shippingAddresses,
    billingAddresses,
    selectedAddressId,
    setSelectedAddressId,
    deleteAddress,
    setFavorite,
    handleAddressChange,
    isLogged,
    setIsLogged,
    showLogin,
    setShowLogin,
    reset,
    watch,
  } = useCheckoutController();

  /* ================= AUTOFILL ================= */

  useEffect(() => {
    const saved = localStorage.getItem('checkoutData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        reset({
          firstName: parsed.firstName ?? '',
          lastName: parsed.lastName ?? '',
          email: parsed.email ?? '',
          phone: parsed.phone ?? '',
          addressLine1: parsed.addressLine1 ?? '',
          addressLine2: parsed.addressLine2 ?? '',
          city: parsed.city ?? '',
          postalCode: parsed.postalCode ?? '',
          country: parsed.country ?? 'ES',
        });
      } catch {
        localStorage.removeItem('checkoutData');
      }
    }
  }, []);

  /* ================= AUTO SAVE ================= */

  useEffect(() => {
    const subscription = watch((values) => {
      localStorage.setItem('checkoutData', JSON.stringify(values));
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
      {/* LEFT */}
      <div className="space-y-6">
        {/* LOGIN APPLE STYLE */}
        {!isLogged && (
          <div className="overflow-hidden rounded-xl bg-neutral-900">
            <motion.div layout className="p-4">
              <AnimatePresence mode="wait">
                {!showLogin ? (
                  <motion.div
                    key="cta"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <p className="text-sm text-neutral-400">
                      {t.checkout.alreadyAccount}{' '}
                      <button
                        onClick={() => setShowLogin(true)}
                        className="underline transition hover:text-white"
                      >
                        {t.checkout.signIn}
                      </button>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <LoginInline
                      onSuccess={async () => {
                        await refreshUser();
                        setIsLogged(true);
                        setShowLogin(false);
                      }}
                    />

                    <button
                      onClick={() => setShowLogin(false)}
                      className="mt-4 text-xs text-neutral-400 transition hover:text-white"
                    >
                      ← {t.checkout.back}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* ADDRESSES */}
        {shippingAddresses.length > 0 && (
          <SavedAddresses
            title={t.checkout.savedAddresses}
            addresses={shippingAddresses}
            selectedId={selectedAddressId}
            onSelect={(addr) => {
              setSelectedAddressId(addr.id);

              const [firstName = '', ...lastParts] = (addr.fullName ?? '').split(' ');

              checkoutForm.reset({
                firstName,
                lastName: lastParts.join(' '),
                addressLabel: addr.label ?? '',
                email: checkoutForm.getValues('email'),
                phone: addr.phone ?? '',
                addressLine1: addr.addressLine1 ?? '',
                addressLine2: addr.addressLine2 ?? '',
                city: addr.city ?? '',
                postalCode: addr.postalCode ?? '',
                country: addr.country ?? 'ES',
              });
            }}
            onFavorite={(id) =>
              setFavorite({
                id,
                type: 'SHIPPING',
              })
            }
            onDelete={deleteAddress}
            isDefault={(address) => !!address.isDefaultShipping}
          />
        )}
        <CheckoutForm
          checkoutForm={checkoutForm}
          onSubmit={submit}
          billingAddresses={billingAddresses}
          setFavorite={setFavorite}
          deleteAddress={deleteAddress}
        />
      </div>
      <CheckoutSummary
        items={items}
        totalPrice={totalPrice}
        loading={loading}
        isValid={checkoutForm.formState.isValid}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        removeItem={removeItem}
      />
    </div>
  );
}
