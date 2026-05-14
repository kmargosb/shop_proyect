"use client";

type Props = {
  user: any;
};

export default function ProfileTab({ user }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
      <h2 className="text-2xl font-bold">Perfil</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 p-5">
          <p className="text-xs text-neutral-500">Email</p>

          <p className="mt-2">{user?.email}</p>
        </div>

        <div className="rounded-2xl border border-white/10 p-5">
          <p className="text-xs text-neutral-500">Rol</p>

          <p className="mt-2">{user?.role}</p>
        </div>
      </div>
    </div>
  );
}