import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDownload, FiFileText, FiCalendar } from 'react-icons/fi';
import { orderService } from '../services/orderService';
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);

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

  const downloadReceiptTxt = (order) => {
    const divider = "========================================\n";
    const line = "----------------------------------------\n";
    let txt = "";
    txt += divider;
    txt += "               ARYA STORE               \n";
    txt += "    Marketplace Produk Digital Premium   \n";
    txt += divider;
    txt += `ID Pesanan : #${order.id}\n`;
    txt += `Tanggal    : ${formatDate(order.date)}\n`;
    txt += `Status     : BERHASIL & AKTIF\n`;
    txt += line;
    txt += "DETAIL PRODUK:\n";
    
    order.items.forEach(item => {
      txt += `${item.quantity}x ${item.name}\n`;
      txt += `   Harga: ${formatPrice(item.price)}\n`;
      const accountsList = item.deliveredAccounts || [ `ACTV-${(Math.random()*1e9).toFixed(0)}-LICS` ];
      txt += "   Akun/Lisensi:\n";
      accountsList.forEach(acc => {
        txt += `   > ${acc}\n`;
      });
    });
    
    txt += line;
    txt += `TOTAL BAYAR: ${formatPrice(order.total)}\n`;
    txt += divider;
    txt += "      Terima kasih atas kepercayaan Anda!\n";
    txt += "    Simpan struk ini sebagai bukti sah.\n";
    txt += "========================================\n";

    const element = document.createElement("a");
    const file = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Struk_AryaStore_#${order.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
                      <button className="btn btn-secondary btn-sm" onClick={() => setActiveReceiptOrder(order)}>
                        <FiFileText size={14} /> Struk Belanja
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Struk Kertas (Thermal Receipt) Modal */}
      {activeReceiptOrder && (
        <div className="receipt-modal-overlay" onClick={() => setActiveReceiptOrder(null)}>
          <div className="receipt-paper-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-paper">
              <div className="receipt-header">
                <h2>ARYA STORE</h2>
                <p>Marketplace Produk Digital Premium</p>
                <p>Telp: 085808703940</p>
              </div>

              <div className="receipt-info-row">
                <span>ID Pesanan:</span>
                <span>#{activeReceiptOrder.id}</span>
              </div>
              <div className="receipt-info-row">
                <span>Tanggal:</span>
                <span>{new Date(activeReceiptOrder.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="receipt-info-row">
                <span>Status:</span>
                <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>LUNAS & AKTIF</span>
              </div>

              <div className="receipt-divider"></div>

              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>DAFTAR PRODUK:</div>
              {activeReceiptOrder.items.map((item, idx) => (
                <div key={idx} className="receipt-item-block">
                  <div className="receipt-item-title">{item.name}</div>
                  <div className="receipt-item-price-row">
                    <span>{item.quantity}x {formatPrice(item.price)}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                  
                  <div className="receipt-license-keys">
                    <div style={{ fontWeight: 'bold', fontSize: '0.7rem', marginBottom: '0.15rem' }}>LISENSI / AKUN:</div>
                    {(item.deliveredAccounts || [ `ACTV-${(Math.random()*1e9).toFixed(0)}-LICS` ]).map((acc, keyIdx) => (
                      <div key={keyIdx} style={{ fontFamily: 'monospace', color: '#1a1a1a', padding: '0.1rem 0' }}>
                        &gt; {acc}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="receipt-total-section">
                <div className="receipt-info-row">
                  <span>TOTAL BAYAR:</span>
                  <span>{formatPrice(activeReceiptOrder.total)}</span>
                </div>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-footer">
                <p>Terima kasih atas kepercayaan Anda!</p>
                <p>Simpan struk ini sebagai bukti transaksi sah Anda secara instan.</p>
              </div>

              {/* Autentik Barcode */}
              <div className="receipt-barcode">
                <span className="barcode-line" style={{ width: '2px' }}></span>
                <span className="barcode-line" style={{ width: '4px' }}></span>
                <span className="barcode-line" style={{ width: '1px' }}></span>
                <span className="barcode-line" style={{ width: '3px' }}></span>
                <span className="barcode-line" style={{ width: '1px' }}></span>
                <span className="barcode-line" style={{ width: '4px' }}></span>
                <span className="barcode-line" style={{ width: '2px' }}></span>
                <span className="barcode-line" style={{ width: '3px' }}></span>
                <span className="barcode-line" style={{ width: '1px' }}></span>
                <span className="barcode-line" style={{ width: '2px' }}></span>
              </div>

              <div className="receipt-actions">
                <button className="btn btn-receipt-download" onClick={() => downloadReceiptTxt(activeReceiptOrder)}>
                  Unduh Struk (.TXT)
                </button>
                <button className="btn btn-receipt-close" onClick={() => setActiveReceiptOrder(null)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
