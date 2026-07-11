'use client';

import type { Address } from '../types';
import { Pencil, Star, Trash2 } from 'lucide-react';

type Props = {
  address: Address;
  defaultText: string;
  setDefaultText: string;
  editText: string;
  deleteText: string;

  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onFavorite: (id: string) => void;
};

export default function AddressCard({
  address,
  defaultText,
  setDefaultText,
  editText,
  deleteText,
  onEdit,
  onDelete,
  onFavorite,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-5 transition hover:border-white/20">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{address.label}</h3>

            <span
              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                address.type === 'SHIPPING'
                  ? 'bg-blue-500/15 text-blue-300'
                  : 'bg-emerald-500/15 text-emerald-300'
              }`}
            >
              {address.type === 'SHIPPING' ? 'ENVÍO' : 'FACTURACIÓN'}
            </span>
          </div>

          <p className="mt-1 text-sm text-neutral-500">{address.phone}</p>
        </div>

        {address.isDefault && (
          <div className="rounded-full bg-white px-3 py-1 text-[10px] font-bold tracking-wide text-black uppercase">
            {defaultText}
          </div>
        )}
      </div>

      <div className="mt-5 space-y-1 text-sm text-neutral-300">
        {address.type === 'BILLING' && (
          <div className="mb-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            {address.companyName && <p className="font-medium text-white">{address.companyName}</p>}

            {address.vatNumber && (
              <p className="mt-1 text-xs text-neutral-400">VAT / NIF · {address.vatNumber}</p>
            )}
          </div>
        )}

        <p>{address.addressLine1}</p>

        {address.addressLine2 && <p>{address.addressLine2}</p>}

        <p>
          {address.city}, {address.postalCode}
        </p>

        <p>{address.country}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => onFavorite(address.id)}
          className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${
            address.isDefault
              ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300'
              : 'border-white/10 text-neutral-300 hover:bg-white/10'
          }`}
        >
          <Star size={15} />

          {address.isDefault ? defaultText : setDefaultText}
        </button>

        <button
          onClick={() => onEdit(address)}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-sm text-neutral-300 hover:bg-white/10"
        >
          <Pencil size={15} />
          {editText}
        </button>

        <button
          onClick={() => onDelete(address.id)}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
        >
          <Trash2 size={15} />
          {deleteText}
        </button>
      </div>
    </div>
  );
}
