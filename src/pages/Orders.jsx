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
      <h1 className="section-title">My Orders</h1>
      <p className="section-subtitle">Manage activations and download purchased licenses</p>

      {loading ? (
        <div className="orders-loading">
          {[1, 2].map(i => (
            <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '12px', marginBottom: '1.5rem' }}></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state glass">
          <span className="empty-state-icon">📦</span>
          <h3>No orders found</h3>
          <p>You haven't purchased any premium products yet.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
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
                  <span className="order-status-badge">active</span>
                </div>
              </div>
              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="order-item-info">
                      <h4>{item.name}</h4>
                      <span>Quantity: {item.quantity}</span>
                    </div>
                    <div className="order-item-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => alert('Mocking product download... key is active!')}>
                        <FiDownload size={14} /> Download File
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => alert(`Mock License Key: ACTV-${(Math.random()*1e9).toFixed(0)}-LICS`)}>
                        <FiFileText size={14} /> View License
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
