'use client';

import { useEffect, useState } from 'react';
import { loadGoogleMaps } from '@/shared/lib/googleMaps';
import { Input } from '@/shared/ui/input';

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
  const [googleReady, setGoogleReady] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    loadGoogleMaps().then(() => setGoogleReady(true));
  }, []);

  async function handleSearch(value: string) {
    onChange({
      addressLine1: value,
    });

    if (!googleReady || value.length < 3) {
      setPredictions([]);
      return;
    }

    const { AutocompleteSuggestion } = await window.google.maps.importLibrary('places');

    const result = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: value,
    });

    setPredictions(result.suggestions ?? []);
    setActiveIndex(-1);
  }

  async function selectItem(suggestion: any) {
    const place = suggestion.placePrediction.toPlace();

    await place.fetchFields({
      fields: ['formattedAddress', 'addressComponents'],
    });

    let city = '';
    let postalCode = '';
    let country = '';

    place.addressComponents?.forEach((c: any) => {
      if (c.types.includes('locality')) city = c.longText;

      if (c.types.includes('postal_code')) postalCode = c.longText;

      if (c.types.includes('country')) country = c.shortText;
    });

    onChange({
      addressLine1: place.formattedAddress,
      city,
      postalCode,
      country,
    });

    setPredictions([]);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!predictions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();

      setActiveIndex((i) => Math.min(i + 1, predictions.length - 1));
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();

      setActiveIndex((i) => Math.max(i - 1, 0));
    }

    if ((e.key === 'Enter' || e.key === 'Tab') && activeIndex >= 0) {
      e.preventDefault();

      void selectItem(predictions[activeIndex]);
    }

    if (e.key === 'Escape') {
      setPredictions([]);
    }
  }

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
              type="button"
              key={index}
              onClick={() => void selectItem(prediction)}
              className={`block w-full cursor-pointer px-3 py-3 text-left text-sm transition ${
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
