'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Address } from '../types';

type Props = {
  title: string;
  addresses: Address[];
  selectedId: string | null;

  onSelect: (address: Address) => void;

  onFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;

  isDefault?: (address: Address) => boolean;

  children?: React.ReactNode;
};

export default function SavedAddresses({
  title,
  addresses,
  selectedId,
  onSelect,
  onFavorite,
  onDelete,
  isDefault,
  children,
}: Props) {
  if (!addresses.length) return null;
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900">
      <>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between p-4"
        >
          <span className="text-sm font-medium">
            {title} ({addresses.length})
          </span>

          <ChevronDown
            size={20}
            className={`text-neutral-400 transition-all duration-300 ${
              open ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>

        {open && (
          <div className="space-y-3 px-4 pb-4">
            {addresses.map((addr) => {
              const selected = selectedId === addr.id;

              const shipping = addr.type === 'SHIPPING';

              return (
                <motion.div
                  key={addr.id}
                  layout
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelect(addr)}
                  className={`relative cursor-pointer rounded-2xl border p-4 pl-10 transition-all ${
                    selected
                      ? shipping
                        ? 'border-blue-500/40 bg-blue-500/5'
                        : 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <motion.div
                    className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 rounded-full border"
                    animate={{
                      backgroundColor: selected ? '#fff' : 'transparent',
                      borderColor: selected ? '#fff' : 'rgba(255,255,255,.4)',
                    }}
                  />

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{addr.label}</p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                          shipping
                            ? 'bg-blue-500/15 text-blue-300'
                            : 'bg-emerald-500/15 text-emerald-300'
                        }`}
                      >
                        {shipping ? 'Envío' : 'Facturación'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFavorite?.(addr.id);
                        }}
                      >
                        <Star
                          size={16}
                          className={`transition ${
                            isDefault?.(addr)
                              ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,.45)]'
                              : 'text-neutral-500 hover:text-yellow-300'
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(addr.id);
                        }}
                      >
                        <Trash2
                          size={16}
                          className="text-neutral-500 transition hover:scale-110 hover:text-red-400"
                        />
                      </button>
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-neutral-400">{addr.addressLine1}</p>

                  <p className="text-xs text-neutral-500">
                    {addr.city}, {addr.country}
                  </p>
                </motion.div>
              );
            })}

            {children}
          </div>
        )}
      </>
    </div>
  );
}
