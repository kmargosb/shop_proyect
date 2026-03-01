export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type CartContextType = {
  items: CartItem[];
  open: boolean;
  setOpen: (value: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  
  totalItems: number;
  totalPrice: number;
};