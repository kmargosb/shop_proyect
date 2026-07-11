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

          <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="space-y-3 px-4 pb-4">
            <h3 className="text-sm text-neutral-400">{title}</h3>

            {addresses.map((addr) => {
              const selected = selectedId === addr.id;

              return (
                <motion.div
                  key={addr.id}
                  layout
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelect(addr)}
                  className={`relative cursor-pointer rounded-xl border p-4 pl-10 ${
                    selected ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/30'
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
                    <div>
                      <p className="font-medium">{addr.label}</p>

                      {addr.companyName && (
                        <p className="text-xs text-neutral-500">{addr.companyName}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFavorite?.(addr.id);
                        }}
                      >
                        <Star
                          size={16}
                          className={
                            isDefault?.(addr)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-neutral-500'
                          }
                        />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(addr.id);
                        }}
                      >
                        <Trash2 size={16} className="text-neutral-500 hover:text-red-400" />
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
