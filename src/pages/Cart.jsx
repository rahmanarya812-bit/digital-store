import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import './Cart.css';

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (isLoggedIn) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  const getEffectivePrice = (item) => {
    if (!item.wholesaleTiers || item.wholesaleTiers.length === 0) return item.price;
    const sortedTiers = [...item.wholesaleTiers].sort((a, b) => b.minQty - a.minQty);
    const matchingTier = sortedTiers.find(tier => item.quantity >= tier.minQty);
    return matchingTier ? matchingTier.price : item.price;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="page cart-page container animate-fadeIn">
      <h1 className="section-title">Your Cart</h1>
      <p className="section-subtitle">Review items and proceed to license activation</p>

      {items.length === 0 ? (
        <div className="empty-state glass">
          <span className="empty-state-icon">🛒</span>
          <h3>Your cart is empty</h3>
          <p>Browse our catalog to add software, themes, or courses to your cart.</p>
          <Link to="/products" className="btn btn-primary">Browse Catalogue</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-main">
            <div className="cart-table-header glass">
              <span>Product</span>
              <span className="text-center">Price</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Subtotal</span>
            </div>
            <div className="cart-items">
              {items.map((item) => {
                const effectivePrice = getEffectivePrice(item);
                const hasDiscount = effectivePrice !== item.price;
                
                return (
                  <div key={item.id} className="cart-table-row glass">
                    <div className="cart-product-info">
                      <img src={item.image} alt={item.name} className="cart-product-img" />
                      <div>
                        <h3>{item.name}</h3>
                        <button className="remove-btn" onClick={() => removeItem(item.id)}>
                          <FiTrash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-price-col text-center">
                      {hasDiscount ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                          <span style={{ textDecoration: 'line-through', fontSize: '0.78rem', opacity: 0.6 }}>
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-success" style={{ fontWeight: '600', color: '#4ecb71' }}>
                            {formatPrice(effectivePrice)}
                          </span>
                        </div>
                      ) : (
                        formatPrice(item.price)
                      )}
                    </div>
                    <div className="cart-item-qty-col">
                      <div className="quantity-control">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <FiMinus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <FiPlus size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-subtotal-col text-right">
                      {formatPrice(effectivePrice * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="cart-actions">
              <button className="btn btn-secondary" onClick={clearCart}>Clear Cart</button>
              <Link to="/products" className="btn btn-secondary">Continue Shopping</Link>
            </div>
          </div>

          <div className="cart-sidebar glass">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
            <div className="summary-row">
              <span>Discount (Launch)</span>
              <span className="text-success">- Rp 0</span>
            </div>
            <hr />
            <div className="summary-row total-row">
              <span>Total</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
            <button className="btn btn-primary w-full checkout-btn" onClick={handleCheckout}>
              Proceed to Activation <FiArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
