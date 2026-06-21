"use client";

import { useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { toast } from "sonner";
import AddressesTab from "./AddressesTab";

type Props = {
  user: any;
  orders: any[];
};

export default function ProfileTab({ user, orders }: Props) {
  const [displayName, setDisplayName] = useState(user?.name || "");

  const [phone, setPhone] = useState(user?.phone || "");

  const [saving, setSaving] = useState(false);

  const totalOrders = orders.length;

  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const lastOrder = orders.length > 0 ? orders[0].createdAt : null;

  const saveProfile = async () => {
    setSaving(true);

    try {
      const res = await apiFetch("/customers/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: displayName,
          phone,
        }),
      });

      if (!res || !res.ok) {
        throw new Error();
      }

      toast.success("Profile updated");
      window.location.reload();
    } catch {
      toast.error("Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PROFILE */}

      <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Profile</h2>

            <p className="mt-2 text-sm text-neutral-500">
              Account information and saved addresses.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs text-neutral-500">Email</p>

            <p className="mt-2 break-words text-sm">{user?.email}</p>
          </div>

          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs text-neutral-500">Login Method</p>

            <p className="mt-2 text-sm">
              {user?.provider === "GOOGLE" ? "Google" : "Email & Password"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs text-neutral-500">Member Since</p>

            <p className="mt-2 text-sm">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "-"}
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 p-5">
          <h3 className="text-sm font-medium">Personal Information</h3>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display Name"
              className="rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm"
            />

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm"
            />

            <button
              onClick={saveProfile}
              disabled={saving}
              className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-black whitespace-nowrap"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* ORDER STATS */}

      <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
        <h3 className="text-lg font-semibold">Order Statistics</h3>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 p-5">
            <p className="text-xs text-neutral-500">Total Orders</p>

            <p className="mt-2 text-2xl font-bold">{totalOrders}</p>
          </div>

          <div className="rounded-2xl border border-white/10 p-5">
            <p className="text-xs text-neutral-500">Total Spent</p>

            <p className="mt-2 text-2xl font-bold">
              €{(totalSpent / 100).toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-5">
            <p className="text-xs text-neutral-500">Last Order</p>

            <p className="mt-2">
              {lastOrder
                ? new Date(lastOrder).toLocaleDateString()
                : "No orders"}
            </p>
          </div>
        </div>
      </div>

      <AddressesTab />
    </div>
  );
}
