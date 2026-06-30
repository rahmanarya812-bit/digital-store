import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const key = searchParams.get('key');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { resetPassword, loading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (!token || !key) {
      navigate('/login', { replace: true });
    }
  }, [token, key, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await resetPassword(token, key, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err) {
      // Error handled by store
    }
  };

  if (success) {
    return (
      <div className="page auth-page container flex-center animate-fadeIn">
        <div className="auth-card glass text-center">
          <div className="success-icon" style={{ fontSize: '3rem', color: '#48bb78', marginBottom: '1rem' }}>✓</div>
          <h2>Kata Sandi Berhasil Diubah!</h2>
          <p>Anda dapat login menggunakan kata sandi baru Anda sekarang.</p>
          <p className="text-sm" style={{ color: '#a0aec0', marginTop: '1rem' }}>Mengarahkan ke halaman login...</p>
          <Link to="/login" className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>Ke Halaman Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page auth-page container flex-center animate-fadeIn">
      <div className="auth-card glass">
        <h1 className="text-center">Buat Kata Sandi Baru</h1>
        <p className="auth-subtitle text-center">Masukkan kata sandi baru yang kuat untuk akun Anda.</p>

        {error && <div className="auth-error-alert">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">Kata Sandi Baru</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                style={{ width: '100%', paddingRight: '40px' }}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer' }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            <small style={{ color: '#a0aec0', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              Min 8 karakter, wajib diawali huruf besar, serta mengandung angka & simbol (@$!%*?&#-_)
            </small>
          </div>
          
          <button type="submit" className="btn btn-primary w-full" style={{ backgroundColor: '#ed8936', borderColor: '#ed8936', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
          </button>
        </form>
      </div>
    </div>
  );
}
