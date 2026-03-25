import { apiFetch } from "@/shared/lib/api";

export async function createOrder(data: any) {
  const res = await apiFetch("/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res) {
    throw new Error("No response from server");
  }

  const order = await res.json();

  console.log("✅ ORDER API RESPONSE:", order);

  return order;
}