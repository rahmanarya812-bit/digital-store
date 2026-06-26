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

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@store.com"
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
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          <span>Don't have an account?</span>
          <Link to="/register">Register Here</Link>
        </div>

        <div className="auth-demo-accounts glass">
          <h4>💡 Demo Credentials:</h4>
          <div>
            <span>Customer:</span> <code>user@store.com</code> / <code>user123</code>
          </div>
          <div>
            <span>Administrator:</span> <code>admin@store.com</code> / <code>admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
