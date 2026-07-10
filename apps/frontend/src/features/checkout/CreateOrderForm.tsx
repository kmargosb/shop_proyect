'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/features/cart/CartContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import LoginInline from '@/features/auth/components/LoginInline';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import CheckoutSummary from './components/CheckoutSummary';
import CheckoutForm from './components/CheckoutForm';
import { useCheckoutController } from './hooks/useCheckoutController';

export default function CreateOrderForm() {
  const { items, clearCart, totalPrice, increaseQuantity, decreaseQuantity, removeItem } =
    useCart();
  const { refreshUser } = useAuth();
  const { t } = useLanguage();
  const {
    checkoutForm,
    submit,
    loading,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    deleteAddress,
    setFavorite,
    loadAddresses,
    handleAddressChange,
    isLogged,
    setIsLogged,
    showLogin,
    setShowLogin,
    isValid,
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
                        await loadAddresses();
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
        {addresses.length > 0 && (
          <div className="space-y-3 rounded-xl bg-neutral-900 p-4">
            <h3 className="text-sm text-neutral-400">{t.checkout.savedAddresses}</h3>

            {addresses.map((addr) => {
              const selected = selectedAddressId === addr.id;

              return (
                <motion.div
                  key={addr.id}
                  layout
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => {
                    setSelectedAddressId(addr.id);

                    const [firstName = '', ...lastParts] = (addr.fullName ?? '').split(' ');

                    checkoutForm.reset({
                      firstName,
                      lastName: lastParts.join(' '),
                      email: checkoutForm.getValues('email'),
                      phone: addr.phone ?? '',
                      addressLine1: addr.addressLine1 ?? '',
                      addressLine2: addr.addressLine2 ?? '',
                      city: addr.city ?? '',
                      postalCode: addr.postalCode ?? '',
                      country: addr.country ?? 'ES',
                    });
                  }}
                  className={`relative cursor-pointer rounded-xl border p-4 pr-4 pl-10 ${
                    selected
                      ? 'border-white bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.08)]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <motion.div
                    layout
                    className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 rounded-full border"
                    animate={{
                      backgroundColor: selected ? '#ffffff' : 'rgba(255,255,255,0)',
                      borderColor: selected ? '#fff' : 'rgba(255,255,255,0.4)',
                    }}
                  />

                  <div className="flex justify-between">
                    <p className="font-medium">{addr.fullName}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFavorite(addr.id);
                        }}
                      >
                        {addr.isDefault ? '⭐' : '☆'}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAddress(addr.id);
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-neutral-400">{addr.addressLine1}</p>
                </motion.div>
              );
            })}
          </div>
        )}
        <CheckoutForm checkoutForm={checkoutForm} onSubmit={submit} />
      </div>
      <CheckoutSummary
        items={items}
        totalPrice={totalPrice}
        loading={loading}
        isValid={!!isValid}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        removeItem={removeItem}
      />
    </div>
  );
}
