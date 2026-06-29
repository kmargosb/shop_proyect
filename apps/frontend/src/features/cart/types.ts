export type CartItem = {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image?: string | null;
  size?: string | null;
  color?: string | null;
};

export type OptimisticCartItem = {
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image?: string | null;
  size?: string | null;
  color?: string | null;
};

export type CartContextType = {
  items: CartItem[];
  open: boolean;
  loading: boolean;
  hydrated: boolean;
  cartBusy: boolean;
  setOpen: (value: boolean) => void;

  addItem: (
    productId: string,
    variantId: string,
    quantity?: number,
    openDrawer?: boolean,
    optimisticItem?: OptimisticCartItem,
  ) => Promise<void>;

  removeItem: (itemId: string) => Promise<void>;

  increaseQuantity: (itemId: string) => Promise<void>;
  decreaseQuantity: (itemId: string) => Promise<void>;

  clearCart: () => void;

  totalItems: number;
  totalPrice: number;
};
