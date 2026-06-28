import { apiFetch } from '@/shared/lib/api';
import { CartItem } from './CartContext';

export const mapItems = (cart: any): CartItem[] =>
  (cart.items ?? [])
    .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((item: any) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.product?.name ?? 'Producto',
      price: item.price,
      quantity: item.quantity,
      stock: item.variant?.stock ?? 0,
      image:
        item.product?.images?.find((img: any) => img.isPrimary)?.url ??
        item.product?.images?.[0]?.url ??
        null,
      size: item.variant?.size ?? null,
      color: item.variant?.color ?? null,
    }));

export async function getCart() {
  const res = await apiFetch('/cart');

  if (!res || !res.ok) {
    return null;
  }

  return res.json();
}

export async function getActiveCartId(
  _cartIdRef: React.MutableRefObject<string | null>,
): Promise<string | null> {
  const cart = await getCart();

  return cart?.id ?? null;
}

export async function fetchCart(setItems: React.Dispatch<React.SetStateAction<CartItem[]>>) {
  const cart = await getCart();

  if (!cart) {
    return;
  }

  setItems(mapItems(cart));
}

export async function addItemRequest(
  cartId: string,
  productId: string,
  variantId: string,
  quantity: number,
) {
  return apiFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({
      productId,
      variantId,
      quantity,
    }),
  });
}

export async function removeItemRequest(itemId: string) {
  return apiFetch(`/cart/items/${itemId}`, {
    method: 'DELETE',
  });
}

export async function updateQuantityRequest(
  _cartId: string,
  productId: string,
  variantId: string,
  quantity: number,
) {
  return apiFetch('/cart/items/update', {
    method: 'POST',
    body: JSON.stringify({
      productId,
      variantId,
      quantity,
    }),
  });
}
