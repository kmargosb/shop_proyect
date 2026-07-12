'use client';

import { Plus } from 'lucide-react';
import type { Address } from '../types';
import AddressCard from './AddressCard';

type Props = {
  title: string;

  buttonText: string;

  addresses: Address[];

  onCreate: () => void;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onFavorite: (address: Address) => void;

  defaultText: string;
  setDefaultText: string;
  editText: string;
  deleteText: string;
};

export default function AddressesSection({
  title,
  buttonText,
  addresses,
  onCreate,
  onEdit,
  onDelete,
  onFavorite,
  defaultText,
  setDefaultText,
  editText,
  deleteText,
}: Props) {
  return (
    <section className="mt-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>

          <p className="mt-1 text-sm text-neutral-500">
            {title.includes('envío')
              ? 'Selecciona la dirección utilizada para recibir tus pedidos.'
              : 'Gestiona las direcciones utilizadas para tus facturas.'}
          </p>
        </div>

        <button
          onClick={onCreate}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white px-4 text-sm font-medium text-black transition hover:bg-neutral-200"
        >
          <Plus size={15} />
          {buttonText}
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-neutral-500">
          {title.includes('envío')
            ? 'Todavía no tienes direcciones de envío.'
            : 'Todavía no tienes direcciones de facturación.'}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              defaultText={defaultText}
              setDefaultText={setDefaultText}
              editText={editText}
              deleteText={deleteText}
              onEdit={onEdit}
              onDelete={onDelete}
              onFavorite={onFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
}
