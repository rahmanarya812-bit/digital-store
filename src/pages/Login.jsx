import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, clearError, loading, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    clearError();
    if (isLoggedIn) {
      navigate(redirect, { replace: true });
    }
  }, [isLoggedIn, navigate, redirect, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="page auth-page container flex-center animate-fadeIn">
      <div className="auth-card glass">
        <h1 className="text-center">Welcome Back</h1>
        <p className="auth-subtitle text-center">Log in to manage your premium activations</p>

        {error && <div className="auth-error-alert">{error}</div>}

        <button 
          className="btn btn-secondary w-full" 
          onClick={async () => {
            const simulatedEmail = `google_user_${Math.floor(Math.random()*1000)}@gmail.com`;
            try { await useAuthStore.getState().googleLogin('Google User', simulatedEmail); } catch (e) {}
          }}
          style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Lanjut dengan Google
        </button>

        <div style={{ textAlign: 'center', margin: '20px 0', color: '#a0aec0', display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, height: '1px', background: '#2d3748' }}></div>
          <span style={{ padding: '0 10px', fontSize: '0.9rem' }}>atau</span>
          <div style={{ flex: 1, height: '1px', background: '#2d3748' }}></div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@gmail.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <div style={{ textAlign: 'right', marginTop: '5px' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#ed8936' }}>Lupa kata sandi?</Link>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          <span>Don't have an account?</span>
          <Link to="/register">Register Here</Link>
        </div>

        
      </div>
    </div>
  );
}
