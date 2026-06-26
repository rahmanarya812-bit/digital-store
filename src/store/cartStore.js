import { create } from 'zustand';
import { orderService } from '../services/orderService';

const getStoredCart = () => {
  try { return JSON.parse(localStorage.getItem('cart_items') || '[]'); }
  catch { return []; }
};

export const useCartStore = create((set, get) => ({
  items: getStoredCart(),
  isOpen: false,
  purchasedIds: [],

  fetchPurchasedIds: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      const data = await orderService.getAll();
      const ids = [];
      data.orders?.forEach(order => {
        order.items?.forEach(item => {
          const pid = Number(item.productId);
          if (!ids.includes(pid)) ids.push(pid);
        });
      });
      set({ purchasedIds: ids });
    } catch (err) {
      console.warn('Failed to fetch purchased product IDs:', err);
    }
  },

  addItem: (product, quantity = 1) => {
    const existing = get().items.find(i => i.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    const newQty = currentQty + quantity;

    if (product.stock !== undefined && product.stock !== null) {
      if (product.stock <= 0) {
        alert(`Maaf, stok untuk ${product.name} sedang habis!`);
        return;
      }
      if (newQty > product.stock) {
        alert(`Batas stok tercapai. Hanya tersisa ${product.stock} lisensi.`);
        return;
      }
    }

    // Warn if purchasing duplicate digital product
    if (get().purchasedIds.includes(Number(product.id))) {
      const confirmBuy = confirm(`⚠️ Peringatan: Anda sudah memiliki lisensi untuk "${product.name}" sebelumnya.\n\nApakah Anda yakin ingin membeli lisensi tambahan?`);
      if (!confirmBuy) return;
    }

    set((state) => {
      let items;
      if (existing) {
        items = state.items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      } else {
        items = [...state.items, { id: product.id, name: product.name, price: product.price, image: product.image, quantity, stock: product.stock }];
      }
      localStorage.setItem('cart_items', JSON.stringify(items));
      return { items, isOpen: true };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const items = state.items.filter(i => i.id !== productId);
      localStorage.setItem('cart_items', JSON.stringify(items));
      return { items };
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return get().removeItem(productId);
    
    const existingItem = get().items.find(i => i.id === productId);
    if (existingItem && existingItem.stock !== undefined && existingItem.stock !== null) {
      if (quantity > existingItem.stock) {
        alert(`Jumlah melebihi batas stok. Maksimal pembelian adalah ${existingItem.stock} lisensi.`);
        return;
      }
    }

    set((state) => {
      const items = state.items.map(i => i.id === productId ? { ...i, quantity } : i);
      localStorage.setItem('cart_items', JSON.stringify(items));
      return { items };
    });
  },

  clearCart: () => {
    localStorage.removeItem('cart_items');
    set({ items: [] });
  },

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
