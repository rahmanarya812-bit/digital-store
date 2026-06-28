import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiCreditCard } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { orderService } from '../services/orderService';
import './Checkout.css';

export default function Checkout() {
  const { items, getTotal, clearCart, fetchPurchasedIds } = useCartStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('ewallet');
  const [selectedEWallet, setSelectedEWallet] = useState('gopay');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (success && showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [success, showToast]);

  const getEffectivePrice = (item) => {
    if (!item.wholesaleTiers || item.wholesaleTiers.length === 0) return item.price;
    const sortedTiers = [...item.wholesaleTiers].sort((a, b) => b.minQty - a.minQty);
    const matchingTier = sortedTiers.find(tier => item.quantity >= tier.minQty);
    return matchingTier ? matchingTier.price : item.price;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        productId: item.id,
        name: item.name,
        price: getEffectivePrice(item),
        quantity: item.quantity
      }));
      const data = await orderService.create(orderItems, getTotal());
      setOrderId(data.order.id);
      setPurchasedItems([...items]);
      setSuccess(true);
      setShowToast(true);
      clearCart();
      fetchPurchasedIds();
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoOrder = async (e) => {
    e?.preventDefault();
    if (!items.length) return;
    setLoading(true);
    try {
      const names = ['Arya Pratama', 'Budi Santoso', 'Siti Rahayu', 'Dewi Lestari', 'Rizky Wijaya'];
      const emails = ['arya@example.com', 'budi@example.com', 'siti@example.com', 'dewi@example.com', 'rizky@example.com'];
      const randomIdx = Math.floor(Math.random() * names.length);
      
      const selectedName = names[randomIdx];
      const selectedEmail = emails[randomIdx];
      
      setName(selectedName);
      setEmail(selectedEmail);

      const orderItems = items.map(item => ({
        productId: item.id,
        name: item.name,
        price: getEffectivePrice(item),
        quantity: item.quantity
      }));

      const data = await orderService.create(orderItems, getTotal());
      setOrderId(data.order.id);
      setPurchasedItems([...items]);
      setSuccess(true);
      setShowToast(true);
      clearCart();
      fetchPurchasedIds();
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page checkout-page success-page container animate-fadeIn">
        {showToast && (
          <div 
            className="toast toast-success animate-fadeIn" 
            style={{ 
              position: 'fixed', 
              top: '90px', 
              right: '2rem', 
              bottom: 'auto',
              zIndex: 10001,
              boxShadow: 'var(--shadow-glow-lg)',
              border: '1px solid rgba(78, 203, 113, 0.3)',
              animation: 'slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <FiCheckCircle size={18} />
            <span>Pembayaran Berhasil! Lisensi Anda telah aktif.</span>
          </div>
        )}
        <div className="success-card glass text-center">
          <FiCheckCircle size={64} className="success-icon" />
          <h1>Order Placed Successfully!</h1>
          <p className="success-order-id">Order ID: #{orderId}</p>
          <p className="success-message">
            Terima kasih atas pembelian Anda. Pembayaran menggunakan e-wallet <strong>{paymentMethod === 'ewallet' ? selectedEWallet.toUpperCase() : 'QRIS'}</strong> berhasil diverifikasi. Kami telah mengirimkan detail aktivasi dan lisensi ke <strong>{email}</strong>.
          </p>
          <div className="license-box glass">
            <h3>🔑 Instant License Keys</h3>
            {purchasedItems.map(item => (
              <div key={item.id} className="license-item">
                <span>{item.name}</span>
                <code>ACTV-{(Math.random()*1e9).toFixed(0)}-LICS</code>
              </div>
            ))}
          </div>
          <div className="success-actions">
            <Link to="/orders" className="btn btn-primary">View My Orders</Link>
            <Link to="/products" className="btn btn-secondary">Browse More</Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page checkout-page container">
        <div className="empty-state glass">
          <span className="empty-state-icon">🛒</span>
          <h3>Checkout is empty</h3>
          <p>You cannot checkout with an empty cart.</p>
          <Link to="/products" className="btn btn-primary">Browse Catalogue</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page checkout-page container animate-fadeIn">
      <h1 className="section-title">License Checkout</h1>
      <p className="section-subtitle">Complete your payment and activate your digital licenses instantly</p>

      <div className="checkout-layout">
        <form className="checkout-form glass" onSubmit={handlePlaceOrder}>
          <h2>Customer Details</h2>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Activation Email</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
            />
          </div>

          <hr />

          <div className="payment-method-sec">
            <h2>Payment Method</h2>
            
            <div className="payment-methods-grid">
              <div 
                className={`payment-option glass ${paymentMethod === 'ewallet' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('ewallet')}
              >
                <FiCreditCard size={20} style={{ color: paymentMethod === 'ewallet' ? 'var(--accent-secondary)' : 'inherit' }} />
                <div className="payment-option-info">
                  <span>E-Wallet (GoPay, OVO, DANA, LinkAja)</span>
                  <p>Bayar langsung menggunakan e-wallet favorit Anda secara instan.</p>
                </div>
              </div>
              
              <div 
                className={`payment-option glass ${paymentMethod === 'bank' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('bank')}
              >
                <FiCreditCard size={20} style={{ color: paymentMethod === 'bank' ? 'var(--accent-primary)' : 'inherit' }} />
                <div className="payment-option-info">
                  <span>QRIS / Bank Transfer</span>
                  <p>Transfer bank atau scan kode QRIS langsung untuk aktivasi lisensi.</p>
                </div>
              </div>
            </div>

            {paymentMethod === 'ewallet' && (
              <div className="ewallet-selector-container glass animate-fadeIn" style={{ marginTop: '0.5rem', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Pilih E-Wallet</h3>
                <div className="ewallet-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[
                    { id: 'gopay', name: 'GoPay', color: '#00AED6' },
                    { id: 'ovo', name: 'OVO', color: '#4C2A86' },
                    { id: 'dana', name: 'DANA', color: '#118EEA' },
                    { id: 'linkaja', name: 'LinkAja', color: '#E52A2D' }
                  ].map(wallet => (
                    <button
                      key={wallet.id}
                      type="button"
                      className={`ewallet-btn ${selectedEWallet === wallet.id ? 'active' : ''}`}
                      onClick={() => setSelectedEWallet(wallet.id)}
                      style={{
                        background: selectedEWallet === wallet.id ? wallet.color : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selectedEWallet === wallet.id ? wallet.color : 'var(--border-color)'}`,
                        color: selectedEWallet === wallet.id ? '#ffffff' : 'var(--text-secondary)',
                        padding: '0.6rem 0.25rem',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        boxShadow: selectedEWallet === wallet.id ? `0 0 10px ${wallet.color}40` : 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {wallet.name}
                    </button>
                  ))}
                </div>
                <div className="form-group">
                  <label htmlFor="phoneNumber">Nomor HP E-Wallet</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    required={paymentMethod === 'ewallet'}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 08123456789"
                    pattern="[0-9]{9,15}"
                    title="Silakan masukkan nomor HP valid antara 9 hingga 15 digit"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="checkout-buttons-container">
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? 'Processing Activation...' : `Pay & Activate — ${formatPrice(getTotal())}`}
            </button>
            <button type="button" className="btn btn-secondary btn-lg w-full auto-order-btn" onClick={handleAutoOrder} disabled={loading}>
              ⚡ One-Click Auto Order (Demo)
            </button>
          </div>
        </form>

        <div className="checkout-summary glass">
          <h2>Summary</h2>
          <div className="summary-items">
            {items.map(item => (
              <div key={item.id} className="summary-item">
                <span className="item-qty-name">{item.quantity}x {item.name}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <hr />
          <div className="summary-row total-row">
            <span>Total to Pay</span>
            <span>{formatPrice(getTotal())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
