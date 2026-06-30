import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [simulatedData, setSimulatedData] = useState(null);
  const { forgotPassword, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      const res = await forgotPassword(email);
      setSuccess(true);
      if (res.simulated) {
        setSimulatedData({
          token: res.simulatedToken,
          key: res.simulatedKey
        });
      }
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="page auth-page container flex-center animate-fadeIn">
      <div className="auth-card glass">
        <h1 className="text-center">Lupa Kata Sandi</h1>
        <p className="auth-subtitle text-center">Masukkan email akunmu. Kami akan kirim link reset ke email tersebut.</p>

        {error && <div className="auth-error-alert">{error}</div>}
        
        {success ? (
          <div className="success-state text-center">
            <div className="success-icon">✉️</div>
            <h3>Cek Email Kamu</h3>
            <p>Link reset password sudah dikirim ke <strong>{email}</strong>. Klik link di email untuk atur ulang kata sandi.</p>
            
            {simulatedData && (
              <div className="alert alert-warning" style={{ marginTop: '20px', textAlign: 'left' }}>
                <strong>Simulasi SMTP Aktif:</strong>
                <p>Klik tombol di bawah untuk simulasi membuka link dari email:</p>
                <Link to={`/reset-password?token=${simulatedData.token}&key=${simulatedData.key}`} className="btn btn-primary w-full" style={{ marginTop: '10px' }}>
                  Buka Link Reset (Simulasi)
                </Link>
              </div>
            )}
            
            <div className="auth-switch" style={{ marginTop: '20px' }}>
              <Link to="/login">Kembali ke Login</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <button type="submit" className="btn btn-primary w-full" style={{ backgroundColor: '#ed8936', borderColor: '#ed8936' }} disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>
        )}

        {!success && (
          <div className="auth-switch">
            <Link to="/login">Kembali ke Login</Link>
          </div>
        )}
      </div>
    </div>
  );
}
