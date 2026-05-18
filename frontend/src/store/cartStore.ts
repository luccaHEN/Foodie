import { create } from 'zustand';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  toggleCart: () => void;
  addItem: (product: { id: string; name: string; price: number }, restaurantId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isCartOpen: false,
  
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  
  addItem: (product, restId) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.productId === product.id);
      
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
          isCartOpen: true, // Abre o carrinho automaticamente ao adicionar
        };
      }

      return {
        items: [...state.items, { productId: product.id, name: product.name, price: product.price, quantity: 1, restaurantId: restId }],
        isCartOpen: true, // Abre o carrinho automaticamente ao adicionar
      };
    });
  },
  removeItem: (productId) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.productId === productId);
      if (existingItem && existingItem.quantity > 1) {
        return { items: state.items.map(item => item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item) };
      }
      return { items: state.items.filter(item => item.productId !== productId) };
    });
  },
  clearCart: () => set({ items: [], isCartOpen: false }),
  getTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
}));