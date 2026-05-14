"use client";

export default function AddressesTab() {
  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Direcciones</h2>

          <p className="mt-2 text-sm text-neutral-500">
            Gestiona tus direcciones de envío y facturación.
          </p>
        </div>

        <button className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black">
          Añadir dirección
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center text-neutral-500">
        Todavía no tienes direcciones guardadas.
      </div>
    </div>
  );
}