'use client';

import AddressAutocomplete from '@/features/checkout/components/AddressAutocomplete';
import AddressesSection from './AddressesSection';
import AddressCard from './AddressCard';
import { useState } from 'react';
import { useAddresses } from '../hooks/useAddresses';
import { COUNTRIES } from '@/shared/constants/countries';
import { MapPin, Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddressRequest,
  setFavoriteAddress,
} from '../addresses.service';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import type { Address, AddressPayload } from '../types';

const emptyForm: AddressPayload = {
  type: 'SHIPPING',

  label: '',

  fullName: '',
  phone: '',

  companyName: '',
  vatNumber: '',

  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  country: 'ES',
};

export default function AddressesTab() {
  const { data: addresses = [], isPending: loading, refetch } = useAddresses();
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const { t } = useLanguage();
  const shippingAddresses = addresses.filter((a) => a.type === 'SHIPPING');
  const billingAddresses = addresses.filter((a) => a.type === 'BILLING');

  /* ================= INPUT ================= */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ================= OPEN CREATE ================= */

  const openCreate = () => {
    setEditing(null);

    setForm(emptyForm);

    setOpenModal(true);
  };

  /* ================= OPEN EDIT ================= */

  const openEdit = (address: Address) => {
    setEditing(address);

    setForm({
      type: address.type,

      label: address.label || 'Casa',

      fullName: address.fullName || '',
      phone: address.phone || '',

      companyName: address.companyName || '',
      vatNumber: address.vatNumber || '',

      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      postalCode: address.postalCode || '',
      country: address.country || 'ES',
    });

    setOpenModal(true);
  };

  const saveAddress = async () => {
    try {
      if (editing) {
        await updateAddress(editing.id, form);
      } else {
        await createAddress(form);
      }

      setOpenModal(false);

      await refetch();
    } catch {
      alert(t.addresses.saveError);
    }
  };

  const deleteAddress = async (id: string) => {
    const confirmed = confirm(t.addresses.deleteConfirm);

    if (!confirmed) return;

    await deleteAddressRequest(id);

    await refetch();
  };

  const setFavorite = async (address: Address) => {
    await setFavoriteAddress({
      id: address.id,
      type: address.type,
    });

    await refetch();
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
        <p className="text-neutral-400">{t.addresses.loading}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
        {/* HEADER */}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{t.addresses.title}</h2>

            <p className="mt-2 text-sm text-neutral-500">{t.addresses.description}</p>
          </div>
        </div>

        {/* EMPTY */}

        {addresses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <MapPin size={40} className="mx-auto text-neutral-600" />

            <p className="mt-4 text-neutral-400">{t.addresses.empty}</p>
          </div>
        ) : (
          <>
            <AddressesSection
              title="📦 Direcciones de envío"
              buttonText="Nueva dirección de envío"
              addresses={shippingAddresses}
              onCreate={() => {
                setForm({
                  ...emptyForm,
                  type: 'SHIPPING',
                });

                setEditing(null);
                setOpenModal(true);
              }}
              onEdit={openEdit}
              onDelete={deleteAddress}
              onFavorite={setFavorite}
              defaultText={t.addresses.default}
              setDefaultText={t.addresses.setDefault}
              editText={t.addresses.edit}
              deleteText={t.addresses.delete}
            />

            <AddressesSection
              title="🧾 Direcciones de facturación"
              buttonText="Nueva dirección de facturación"
              addresses={billingAddresses}
              onCreate={() => {
                setForm({
                  ...emptyForm,
                  type: 'BILLING',
                });

                setEditing(null);
                setOpenModal(true);
              }}
              onEdit={openEdit}
              onDelete={deleteAddress}
              onFavorite={setFavorite}
              defaultText={t.addresses.default}
              setDefaultText={t.addresses.setDefault}
              editText={t.addresses.edit}
              deleteText={t.addresses.delete}
            />
          </>
        )}
      </div>

      {/* MODAL */}

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editing ? t.addresses.editTitle : t.addresses.createTitle}
                </h3>

                <p className="mt-1 text-sm text-neutral-500">{t.addresses.saveDescription}</p>
              </div>

              <button
                onClick={() => setOpenModal(false)}
                className="rounded-full p-2 text-neutral-500 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}

            <div className="mt-6 grid gap-4">
              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                  form.type === 'SHIPPING'
                    ? 'border-blue-500/20 bg-blue-500/10 text-blue-300'
                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                }`}
              >
                {form.type === 'SHIPPING' ? '📦 Dirección de envío' : '🧾 Dirección de facturación'}
              </div>

              <input
                name="label"
                value={form.label}
                onChange={handleChange}
                placeholder="Ej. Casa, Trabajo, Oficina..."
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white transition outline-none placeholder:text-neutral-500 focus:border-white/30"
              />

              {/* FULL NAME */}

              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder={t.addresses.fullName}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white transition outline-none placeholder:text-neutral-500 focus:border-white/30"
              />

              {/* PHONE */}

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder={t.addresses.phone}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white transition outline-none placeholder:text-neutral-500 focus:border-white/30"
              />

              {form.type === 'BILLING' && (
                <>
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Razón social"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white transition outline-none placeholder:text-neutral-500 focus:border-white/30"
                  />

                  <input
                    name="vatNumber"
                    value={form.vatNumber}
                    onChange={handleChange}
                    placeholder="VAT / NIF / CIF"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white transition outline-none placeholder:text-neutral-500 focus:border-white/30"
                  />
                </>
              )}

              {/* ADDRESS AUTOCOMPLETE */}

              <AddressAutocomplete
                value={form.addressLine1}
                onChange={(data) =>
                  setForm((prev) => ({
                    ...prev,
                    addressLine1: data.addressLine1 || '',
                    city: data.city || '',
                    postalCode: data.postalCode || '',
                    country: data.country || 'ES',
                  }))
                }
              />

              {/* ADDRESS 2 */}

              <input
                name="addressLine2"
                value={form.addressLine2}
                onChange={handleChange}
                placeholder={t.addresses.apartment}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white transition outline-none placeholder:text-neutral-500 focus:border-white/30"
              />

              {/* CITY + ZIP */}

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="city"
                  value={form.city || ''}
                  onChange={handleChange}
                  placeholder={t.addresses.city}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white transition outline-none placeholder:text-neutral-500 focus:border-white/30"
                />

                <input
                  name="postalCode"
                  value={form.postalCode || ''}
                  onChange={handleChange}
                  placeholder={t.addresses.zipCode}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white transition outline-none placeholder:text-neutral-500 focus:border-white/30"
                />
              </div>

              {/* COUNTRY */}

              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white transition outline-none focus:border-white/30"
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code} className="bg-white text-black">
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* FOOTER */}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpenModal(false)}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-neutral-300 transition hover:bg-white/10"
              >
                {t.addresses.cancel}
              </button>

              <button
                onClick={saveAddress}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-200"
              >
                {editing ? t.addresses.saveChanges : t.addresses.createAddress}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
