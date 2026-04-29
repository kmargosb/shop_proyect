"use client";

import { useEffect, useState } from "react";
import { loadGoogleMaps } from "@/shared/lib/googleMaps";
import { Input } from "@/shared/ui/input";

export default function AddressAutocomplete({ value, onChange }: any) {
  const [googleReady, setGoogleReady] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);  

  useEffect(() => {
    const init = async () => {
      await loadGoogleMaps();
      setGoogleReady(true);
    };

    init();
  }, []);

  /* ================= SEARCH ================= */

  const handleSearch = async (val: string) => {
    onChange({ addressLine1: val });

    if (!googleReady || val.length < 3) {
      setPredictions([]);
      return;
    }

    try {
      const { AutocompleteSuggestion } =
        await window.google.maps.importLibrary("places");

      const result =
        await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: val,
        });

      setPredictions(result.suggestions || []);
      setActiveIndex(-1);
    } catch (e) {
      console.error(e);
    }
  };

  /* ================= SELECT ================= */

  const selectItem = async (suggestion: any) => {
    const place = suggestion.placePrediction.toPlace();

    await place.fetchFields({
      fields: ["formattedAddress", "addressComponents"],
    });

    let city = "";
    let postalCode = "";
    let country = "";

    place.addressComponents?.forEach((c: any) => {
      if (c.types.includes("locality")) city = c.longText;
      if (c.types.includes("postal_code")) postalCode = c.longText;
      if (c.types.includes("country")) country = c.shortText;
    });

    onChange({
      addressLine1: place.formattedAddress,
      city,
      postalCode,
      country,
    });

    setPredictions([]);
    setActiveIndex(-1);
  };

  /* ================= KEYBOARD ================= */

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (predictions.length === 0) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    setActiveIndex((prev) =>
      prev < predictions.length - 1 ? prev + 1 : prev
    );
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }

  if (e.key === "Enter" || e.key === "Tab") {
    if (activeIndex >= 0) {
      e.preventDefault(); // 🔥 clave
      selectItem(predictions[activeIndex]);
    }
  }

  if (e.key === "Escape") {
    setPredictions([]);
  }
};

  return (
    <div className="relative">
  <Input
    value={value}
    onChange={(e) => handleSearch(e.target.value)}
    onKeyDown={handleKeyDown}
    placeholder="Dirección"
  />

  {predictions.length > 0 && (
    <div className="absolute z-50 w-full mt-1 rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl overflow-hidden">
      {predictions.map((p, i) => (
        <div
          key={i}
          onClick={() => selectItem(p)}
          className={`px-3 py-3 cursor-pointer text-sm transition
          ${
            i === activeIndex
              ? "bg-white/10 border-l-2 border-white"
              : "hover:bg-white/5"
          }`}
        >
          {p.placePrediction.text.text}
        </div>
      ))}
    </div>
  )}
</div>
  );
}