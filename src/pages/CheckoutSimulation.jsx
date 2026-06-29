import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { api } from '../services/api';

export default function CheckoutSimulation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || '3';
  const amount = searchParams.get('amount') || '149000';

  const [paying, setPaying] = useState(false);
  const [status, setStatus] = useState('pending'); // pending, success, error

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const handleSimulatePayment = async () => {
    setPaying(true);
    try {
      // Send simulated webhook call to our server
      const response = await fetch('/api/checkout/pakasir-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: String(orderId),
          status: 'completed',
          amount: Number(amount)
        })
      });
      const data = await response.json();
      if (data && data.success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={{
      background: '#0c0c14',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: '#151521',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        {status === 'pending' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', background: 'rgba(108, 99, 255, 0.1)', color: '#6c63ff', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                QRIS Simpanan
              </div>
            </div>
            
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>Arya Store QRIS</h2>
            <p style={{ color: '#a0aec0', fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>Scan QRIS di bawah untuk menyelesaikan transaksi Anda</p>
            
            <div style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '12px',
              display: 'inline-block',
              marginBottom: '1.5rem',
              boxShadow: '0 10px 20px rgba(0,0,0,0.15)'
            }}>
              {/* Clean simulated QR code box using visual SVG */}
              <svg width="180" height="180" viewBox="0 0 100 100" style={{ display: 'block' }}>
                <rect width="100" height="100" fill="#ffffff" />
                {/* Mock QR corners */}
                <rect x="5" y="5" width="25" height="25" fill="#000000" />
                <rect x="9" y="9" width="17" height="17" fill="#ffffff" />
                <rect x="13" y="13" width="9" height="9" fill="#000000" />
                
                <rect x="70" y="5" width="25" height="25" fill="#000000" />
                <rect x="74" y="9" width="17" height="17" fill="#ffffff" />
                <rect x="78" y="13" width="9" height="9" fill="#000000" />
                
                <rect x="5" y="70" width="25" height="25" fill="#000000" />
                <rect x="9" y="74" width="17" height="17" fill="#ffffff" />
                <rect x="13" y="78" width="9" height="9" fill="#000000" />
                
                {/* Random barcode center blocks */}
                <rect x="38" y="38" width="24" height="24" fill="#000000" />
                <rect x="42" y="42" width="16" height="16" fill="#ffffff" />
                <rect x="46" y="46" width="8" height="8" fill="#000000" />
                
                {/* Random pixel fillers */}
                <rect x="35" y="10" width="5" height="15" fill="#000" />
                <rect x="45" y="20" width="10" height="5" fill="#000" />
                <rect x="15" y="40" width="15" height="5" fill="#000" />
                <rect x="10" y="55" width="5" height="10" fill="#000" />
                <rect x="80" y="45" width="10" height="15" fill="#000" />
                <rect x="50" y="75" width="15" height="5" fill="#000" />
                <rect x="75" y="80" width="5" height="10" fill="#000" />
              </svg>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#a0aec0', marginBottom: '0.5rem' }}>
                <span>ID Tagihan:</span>
                <span style={{ color: '#ffffff', fontWeight: '600' }}>INV-{orderId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#a0aec0' }}>
                <span>Total Nominal:</span>
                <span style={{ color: '#4ecb71', fontWeight: '700', fontSize: '1rem' }}>{formatPrice(amount)}</span>
              </div>
            </div>
            
            <button
              onClick={handleSimulatePayment}
              disabled={paying}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: '#4ecb71',
                color: '#0c0c14',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(78, 203, 113, 0.3)'
              }}
            >
              {paying ? 'Memproses Simulasi...' : 'Bayar Sukses (Simulasi)'}
            </button>
          </>
        )}

        {status === 'success' && (
          <div style={{ padding: '1rem 0' }}>
            <FiCheckCircle size={56} color="#4ecb71" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>Pembayaran Sukses!</h2>
            <p style={{ color: '#a0aec0', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
              Verifikasi simulasi berhasil diterima oleh server toko. Lisensi/akun Anda siap disajikan pada layar checkout utama.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ padding: '1rem 0' }}>
            <FiAlertCircle size={56} color="#ff6b6b" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>Gagal Memproses</h2>
            <p style={{ color: '#a0aec0', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Terjadi kesalahan komunikasi dengan server toko saat memproses webhook notifikasi.
            </p>
            <button
              onClick={() => setStatus('pending')}
              style={{
                padding: '0.6rem 1.2rem',
                background: 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
