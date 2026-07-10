'use client';

import { Input } from '@/shared/ui/input';
import { useAddressAutocomplete } from '../hooks/useAddressAutocomplete';

type Props = {
  value: string;
  onChange: (data: {
    addressLine1: string;
    city?: string;
    postalCode?: string;
    country?: string;
  }) => void;
};

export default function AddressAutocomplete({ value, onChange }: Props) {
  const { predictions, activeIndex, handleSearch, handleKeyDown, selectItem } =
    useAddressAutocomplete(onChange);

  return (
    <div className="relative">
      <Input
        value={value ?? ''}
        placeholder="Address"
        onChange={(e) => void handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {predictions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl">
          {predictions.map((prediction, index) => (
            <button
              key={index}
              type="button"
              onClick={() => void selectItem(prediction)}
              className={`block w-full px-3 py-3 text-left text-sm transition ${
                index === activeIndex ? 'border-l-2 border-white bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              {prediction.placePrediction.text.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
