"use client";

export default function SecurityTab() {
  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
      <h2 className="text-2xl font-bold">Seguridad</h2>

      <p className="mt-2 text-sm text-neutral-500">
        Gestiona contraseña y seguridad de la cuenta.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 p-5">
          <p className="text-sm font-medium">Contraseña</p>

          <p className="mt-2 text-sm text-neutral-500">
            Actualiza tu contraseña regularmente para mantener tu cuenta segura.
          </p>

          <button className="mt-5 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black">
            Cambiar contraseña
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 p-5">
          <p className="text-sm font-medium">Sesiones</p>

          <p className="mt-2 text-sm text-neutral-500">
            Controla dispositivos y sesiones activas.
          </p>

          <button className="mt-5 rounded-xl border border-white/10 px-4 py-2 text-sm text-white">
            Ver sesiones
          </button>
        </div>
      </div>
    </div>
  );
}