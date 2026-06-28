import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDownload, FiFileText, FiCalendar } from 'react-icons/fi';
import { orderService } from '../services/orderService';
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getAll()
      .then(data => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page orders-page container animate-fadeIn">
      <h1 className="section-title">Pesanan Saya</h1>
      <p className="section-subtitle">Kelola aktivasi dan unduh lisensi produk digital Anda</p>

      {loading ? (
        <div className="orders-loading">
          {[1, 2].map(i => (
            <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '12px', marginBottom: '1.5rem' }}></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state glass">
          <span className="empty-state-icon">📦</span>
          <h3>Belum ada pesanan</h3>
          <p>Anda belum melakukan pembelian produk premium.</p>
          <Link to="/products" className="btn btn-primary">Mulai Belanja</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card glass">
              <div className="order-header">
                <div>
                  <span className="order-id">Order ID: #{order.id}</span>
                  <div className="order-date">
                    <FiCalendar size={14} /> {formatDate(order.date)}
                  </div>
                </div>
                <div className="order-meta-info">
                  <span className="order-total-price">{formatPrice(order.total)}</span>
                  <span className="order-status-badge">aktif</span>
                </div>
              </div>
              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="order-item-info">
                      <h4>{item.name}</h4>
                      <span>Kuantitas: {item.quantity}</span>
                    </div>
                    <div className="order-item-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => alert('Mengunduh file produk... file siap!')}>
                        <FiDownload size={14} /> Unduh File
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => alert(item.deliveredAccounts ? `Lisensi/Akun:\n${item.deliveredAccounts.join('\n')}` : `Lisensi/Akun:\nACTV-${(Math.random()*1e9).toFixed(0)}-LICS`)}>
                        <FiFileText size={14} /> Lihat Lisensi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
