import { apiFetch } from "@/lib/api";

export async function createOrder(data: any) {
  const res = await apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res) throw new Error("No response");

  return res.json();
}