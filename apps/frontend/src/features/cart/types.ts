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
  loading: boolean;
  hydrated: boolean;
  cartBusy: boolean;

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

export type CartResponseItem = {
  id: string;
  productId: string;
  variantId: string;
  price: number;
  quantity: number;
  createdAt: string;

  product?: {
    name: string;
    images: {
      url: string;
      isPrimary: boolean;
    }[];
  };

  variant?: {
    stock: number;
    size: string;
    color: string;
  };
};

export type CartResponse = {
  id: string;
  items: CartResponseItem[];
};
