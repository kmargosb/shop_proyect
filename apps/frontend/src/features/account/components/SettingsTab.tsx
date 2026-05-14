"use client";

export default function SettingsTab() {
  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
      <h2 className="text-2xl font-bold">Configuración</h2>

      <p className="mt-2 text-sm text-neutral-500">
        Preferencias y experiencia de usuario.
      </p>

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 p-5">
          <div>
            <p className="font-medium">Emails promocionales</p>

            <p className="mt-1 text-sm text-neutral-500">
              Recibe novedades y lanzamientos.
            </p>
          </div>

          <button className="rounded-full bg-white px-4 py-2 text-sm text-black">
            Activo
          </button>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/10 p-5">
          <div>
            <p className="font-medium">Modo premium</p>

            <p className="mt-1 text-sm text-neutral-500">
              Experiencia visual avanzada para clientes.
            </p>
          </div>

          <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">
            Próximamente
          </button>
        </div>
      </div>
    </div>
  );
}