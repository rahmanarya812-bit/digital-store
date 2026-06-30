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
      setPurchasedItems(data.order.items);
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
      const emails = ['arya@gmail.com', 'budi@gmail.com', 'siti@gmail.com', 'dewi@gmail.com', 'rizky@gmail.com'];
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
      setPurchasedItems(data.order.items);
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
          <div className="license-box glass" style={{ textAlign: 'left' }}>
            <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>🔑 Instant License Keys / Account Credentials</h3>
            {purchasedItems.map(item => (
              <div key={item.id || item.productId} className="license-item" style={{ marginBottom: '1rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontWeight: '700', color: '#00D9FF', display: 'block', marginBottom: '0.5rem' }}>{item.name} ({item.quantity}x):</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {item.deliveredAccounts && item.deliveredAccounts.map((account, idx) => (
                    <code key={idx} style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#4ecb71',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      display: 'block',
                      wordBreak: 'break-all',
                      borderLeft: '3px solid #4ecb71'
                    }}>{account}</code>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="success-actions">
            <Link to="/orders" className="btn btn-primary">Lihat Pesanan Saya</Link>
            <Link to="/products" className="btn btn-secondary">Jelajahi Produk Lain</Link>
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
          <h3>Keranjang Belanja Kosong</h3>
          <p>Anda tidak bisa melakukan checkout dengan keranjang kosong.</p>
          <Link to="/products" className="btn btn-primary">Jelajahi Katalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page checkout-page container animate-fadeIn">
      <h1 className="section-title">Checkout Lisensi</h1>
      <p className="section-subtitle">Selesaikan pembayaran Anda untuk mengaktifkan lisensi digital secara instan</p>

      <div className="checkout-layout">
        <form className="checkout-form glass" onSubmit={handlePlaceOrder}>
          <h2>Detail Pelanggan</h2>
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap</label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Arya Pratama"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Aktivasi</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: arya@gmail.com"
            />
          </div>

          <hr />

          <div className="payment-method-sec">
            <h2>Metode Pembayaran</h2>
            
            <div className="payment-methods-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div 
                className={`payment-option glass ${paymentMethod === 'qris' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('qris')}
                style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer', borderRadius: '8px' }}
              >
                <FiCreditCard size={20} style={{ color: paymentMethod === 'qris' ? '#4ecb71' : 'inherit' }} />
                <div className="payment-option-info">
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>QRIS (Otomatis)</span>
                  <p style={{ fontSize: '0.7rem', color: '#a0aec0', marginTop: '0.25rem', lineHeight: '1.3' }}>Scan langsung, aktif otomatis.</p>
                </div>
              </div>

              <div 
                className={`payment-option glass ${paymentMethod === 'ewallet' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('ewallet')}
                style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer', borderRadius: '8px' }}
              >
                <FiCreditCard size={20} style={{ color: paymentMethod === 'ewallet' ? 'var(--accent-secondary)' : 'inherit' }} />
                <div className="payment-option-info">
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>E-Wallet Manual</span>
                  <p style={{ fontSize: '0.7rem', color: '#a0aec0', marginTop: '0.25rem', lineHeight: '1.3' }}>Kirim ke GoPay/DANA/ShopeePay.</p>
                </div>
              </div>
              
              <div 
                className={`payment-option glass ${paymentMethod === 'bank' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('bank')}
                style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer', borderRadius: '8px' }}
              >
                <FiCreditCard size={20} style={{ color: paymentMethod === 'bank' ? 'var(--accent-primary)' : 'inherit' }} />
                <div className="payment-option-info">
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>Transfer Bank</span>
                  <p style={{ fontSize: '0.7rem', color: '#a0aec0', marginTop: '0.25rem', lineHeight: '1.3' }}>Transfer manual bank SeaBank.</p>
                </div>
              </div>
            </div>

            {paymentMethod === 'qris' && (
              <div className="ewallet-selector-container glass animate-fadeIn" style={{ marginTop: '0.5rem', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4ecb71' }}>Pembayaran QRIS Otomatis</h3>
                <p style={{ fontSize: '0.8rem', color: '#a0aec0', lineHeight: '1.5', margin: 0 }}>
                  Setelah mengklik "Buat Pesanan", kode QRIS pembayaran dinamis akan ditampilkan langsung di layar ini. Cukup scan menggunakan aplikasi Gopay, DANA, OVO, ShopeePay, atau Mobile Banking Anda. Lisensi Anda akan langsung terkirim dan aktif otomatis setelah bayar!
                </p>
              </div>
            )}

            {paymentMethod === 'ewallet' && (
              <div className="ewallet-selector-container glass animate-fadeIn" style={{ marginTop: '0.5rem', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Pilih E-Wallet</h3>
                <div className="ewallet-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[
                    { id: 'gopay', name: 'GoPay', color: '#00AED6' },
                    { id: 'dana', name: 'DANA', color: '#118EEA' },
                    { id: 'shopeepay', name: 'ShopeePay', color: '#EE4D2D' }
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

                {/* E-Wallet Account Info Card */}
                <div style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  marginBottom: '1rem'
                }}>
                  {selectedEWallet === 'gopay' && (
                    <div>
                      <span style={{ color: '#00AED6', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>GOPAY AKUN TOKO:</span>
                      <strong style={{ fontSize: '1.2rem', color: '#ffffff', letterSpacing: '0.03em' }}>085808703940</strong>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginTop: '0.25rem' }}>Penerima: <strong>dhafy haykal</strong></span>
                    </div>
                  )}
                  {selectedEWallet === 'dana' && (
                    <div>
                      <span style={{ color: '#118EEA', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>DANA AKUN TOKO:</span>
                      <strong style={{ fontSize: '1.2rem', color: '#ffffff', letterSpacing: '0.03em' }}>085808703940</strong>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginTop: '0.25rem' }}>Penerima: <strong>moch arya qadhafy rahman</strong></span>
                    </div>
                  )}
                  {selectedEWallet === 'shopeepay' && (
                    <div>
                      <span style={{ color: '#EE4D2D', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>SHOPEEPAY AKUN TOKO:</span>
                      <strong style={{ fontSize: '1.2rem', color: '#ffffff', letterSpacing: '0.03em' }}>085607492894</strong>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginTop: '0.25rem' }}>Penerima: <strong>Ary4_Store</strong></span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Nomor HP Pengirim E-Wallet</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    required={paymentMethod === 'ewallet'}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    pattern="[0-9]{9,15}"
                    title="Silakan masukkan nomor HP valid antara 9 hingga 15 digit"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="bank-transfer-info glass animate-fadeIn" style={{ marginTop: '0.5rem', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Detail Rekening Bank Transfer:</h3>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <span style={{ color: '#00D9FF', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>BANK SEABANK</span>
                  <strong style={{ fontSize: '1.25rem', color: '#ffffff', letterSpacing: '0.05em' }}>901552586694</strong>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#a0aec0', marginTop: '0.25rem' }}>Nama Rekening: <strong>moch arya qadhafy rahman</strong></span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#8f9bb3', lineHeight: '1.4' }}>
                  💡 <em>Silakan lakukan transfer ke rekening SeaBank di atas. Pembelian Anda akan langsung aktif secara instan setelah transfer dikonfirmasi.</em>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-buttons-container">
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? 'Memproses Aktivasi...' : `Bayar & Aktifkan — ${formatPrice(getTotal())}`}
            </button>
            <button type="button" className="btn btn-secondary btn-lg w-full auto-order-btn" onClick={handleAutoOrder} disabled={loading}>
              ⚡ Pembelian Auto Satu-Klik (Demo)
            </button>
          </div>
        </form>

        <div className="checkout-summary glass">
          <h2>Ringkasan Belanja</h2>
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
            <span>Total Pembayaran</span>
            <span>{formatPrice(getTotal())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
