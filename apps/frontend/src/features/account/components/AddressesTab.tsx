'use client';

import { useState } from 'react';
import { useAddresses } from '../hooks/useAddresses';
import AddressAutocomplete from '@/features/checkout/components/AddressAutocomplete';
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
import type { Address } from '../types';

const emptyForm = {
  fullName: '',
  phone: '',
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
  const [form, setForm] = useState(emptyForm);
  const { t } = useLanguage();

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
      fullName: address.fullName || '',
      phone: address.phone || '',
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

  const setFavorite = async (id: string) => {
    await setFavoriteAddress(id);

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

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            <Plus size={16} />
            {t.addresses.add}
          </button>
        </div>

        {/* EMPTY */}

        {addresses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <MapPin size={40} className="mx-auto text-neutral-600" />

            <p className="mt-4 text-neutral-400">{t.addresses.empty}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-3xl border border-white/10 bg-black/30 p-5 transition hover:border-white/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{address.fullName}</h3>

                    <p className="mt-1 text-sm text-neutral-500">{address.phone}</p>
                  </div>

                  {address.isDefault && (
                    <div className="rounded-full bg-white px-3 py-1 text-[10px] font-bold tracking-wide text-black uppercase">
                      {t.addresses.default}
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-1 text-sm text-neutral-300">
                  <p>{address.addressLine1}</p>

                  {address.addressLine2 && <p>{address.addressLine2}</p>}

                  <p>
                    {address.city}, {address.postalCode}
                  </p>

                  <p>{address.country}</p>
                </div>

                {/* ACTIONS */}

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setFavorite(address.id)}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${
                      address.isDefault
                        ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300'
                        : 'border-white/10 text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    <Star size={15} />

                    {address.isDefault ? t.addresses.default : t.addresses.setDefault}
                  </button>

                  <button
                    onClick={() => openEdit(address)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-sm text-neutral-300 transition hover:bg-white/10"
                  >
                    <Pencil size={15} />
                    {t.addresses.edit}
                  </button>

                  <button
                    onClick={() => deleteAddress(address.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    <Trash2 size={15} />
                    {t.addresses.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
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
