import { apiFetch } from '@/shared/lib/api';
import { CartItem } from './CartContext';

const CART_KEY = 'cartId';

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

export async function createCart(
  cartIdRef: React.MutableRefObject<string | null>,
): Promise<string | null> {
  const res = await apiFetch('/cart', {
    method: 'POST',
  });

  if (!res || !res.ok) {
    return null;
  }

  const cart = await res.json();

  localStorage.setItem(CART_KEY, cart.id);

  cartIdRef.current = cart.id;

  return cart.id;
}

export async function ensureCart(
  cartIdRef: React.MutableRefObject<string | null>,
): Promise<string | null> {
  let cartId = cartIdRef.current ?? localStorage.getItem(CART_KEY);

  if (cartId && !cartIdRef.current) {
    cartIdRef.current = cartId;
  }

  if (!cartId) {
    return createCart(cartIdRef);
  }

  const res = await apiFetch(`/cart/${cartId}`);

  if (!res || !res.ok) {
    localStorage.removeItem(CART_KEY);

    return createCart(cartIdRef);
  }

  const cart = await res.json();

  if (cart.id !== cartId) {
    localStorage.setItem(CART_KEY, cart.id);
    cartIdRef.current = cart.id;
  }

  return cart.id;
}

export async function getActiveCartId(
  cartIdRef: React.MutableRefObject<string | null>,
): Promise<string | null> {
  if (cartIdRef.current) {
    return cartIdRef.current;
  }

  const stored = localStorage.getItem(CART_KEY);

  if (stored) {
    cartIdRef.current = stored;
    return stored;
  }

  return createCart(cartIdRef);
}

export async function fetchCart(
  cartId: string,
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>,
) {
  const res = await apiFetch(`/cart/${cartId}`);

  if (!res || !res.ok) {
    return;
  }

  const cart = await res.json();

  setItems(mapItems(cart));
}

export async function addItemRequest(
  cartId: string,
  productId: string,
  variantId: string,
  quantity: number,
) {
  return apiFetch(`/cart/${cartId}/items`, {
    method: 'POST',
    body: JSON.stringify({
      productId,
      variantId,
      quantity,
    }),
  });
}
