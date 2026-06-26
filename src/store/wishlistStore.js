import { create } from 'zustand';

const getStoredWishlist = () => {
  try { return JSON.parse(localStorage.getItem('wishlist_items') || '[]'); }
  catch { return []; }
};

export const useWishlistStore = create((set, get) => ({
  items: getStoredWishlist(),

  addItem: (product) => {
    set((state) => {
      if (state.items.find(i => i.id === product.id)) return state;
      const items = [...state.items, { id: product.id, name: product.name, price: product.price, originalPrice: product.originalPrice, image: product.image, category: product.category, rating: product.rating }];
      localStorage.setItem('wishlist_items', JSON.stringify(items));
      return { items };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const items = state.items.filter(i => i.id !== productId);
      localStorage.setItem('wishlist_items', JSON.stringify(items));
      return { items };
    });
  },

  toggleItem: (product) => {
    const exists = get().items.find(i => i.id === product.id);
    if (exists) get().removeItem(product.id);
    else get().addItem(product);
  },

  isInWishlist: (productId) => get().items.some(i => i.id === productId),
}));
