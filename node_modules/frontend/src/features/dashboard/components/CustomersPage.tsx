"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { Search } from "lucide-react";

type Customer = {
  email: string;
  fullName: string;
  totalSpent: number;
  ordersCount: number;
  lastOrderDate: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ================= */

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/customers");

        if (!res || !res.ok) throw new Error();

        const data = await res.json();

        setCustomers(Array.isArray(data) ? data : data.data ?? []);
      } catch {
        console.error("Error cargando customers");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
  if (!Array.isArray(customers)) return [];
  
  return customers.filter((c) =>
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.fullName.toLowerCase().includes(search.toLowerCase())
  );
}, [customers, search]);

  if (loading) return <p>Cargando clientes...</p>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Customers</h2>
          <p className="text-sm text-neutral-400">
            Gestiona tus clientes y su actividad
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="pl-8 pr-3 py-2 bg-[#111] border border-white/10 rounded-lg text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-neutral-400">
            <tr>
              <th className="p-4 text-left">Cliente</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Pedidos</th>
              <th className="p-4 text-left">Total gastado</th>
              <th className="p-4 text-left">Última compra</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c, i) => (
              <tr
                key={i}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="p-4">{c.fullName}</td>
                <td className="p-4 text-neutral-400">{c.email}</td>
                <td className="p-4">{c.ordersCount}</td>
                <td className="p-4">
                  €{(c.totalSpent / 100).toFixed(2)}
                </td>
                <td className="p-4 text-neutral-400">
                  {new Date(c.lastOrderDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EMPTY */}
      {filtered.length === 0 && (
        <p className="text-center text-neutral-500">
          No se encontraron clientes
        </p>
      )}
    </div>
  );
}