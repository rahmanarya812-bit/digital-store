import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import './CartDrawer.css';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotal } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const drawerRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target)) {
        closeCart();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeCart]);

  const handleCheckout = () => {
    closeCart();
    if (isLoggedIn) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-overlay">
      <div className="cart-drawer glass" ref={drawerRef}>
        <div className="cart-drawer-header">
          <h2><FiShoppingBag size={20} /> Your Cart</h2>
          <button className="close-btn" onClick={closeCart} aria-label="Close Cart">
            <FiX size={24} />
          </button>
        </div>

        <div className="cart-drawer-content">
          {items.length === 0 ? (
            <div className="empty-cart">
              <span className="empty-cart-icon">🛒</span>
              <h3>Your cart is empty</h3>
              <p>Add some premium digital products to get started.</p>
              <button className="btn btn-primary" onClick={closeCart}>Browse Products</button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <span className="cart-item-price">{formatPrice(item.price)}</span>
                    <div className="cart-item-actions">
                      <div className="quantity-control">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <FiMinus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <FiPlus size={12} />
                        </button>
                      </div>
                      <button className="remove-item-btn" onClick={() => removeItem(item.id)} aria-label="Remove item">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total-row">
              <span>Total:</span>
              <span className="cart-total-price">{formatPrice(getTotal())}</span>
            </div>
            <button className="btn btn-primary w-full checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
