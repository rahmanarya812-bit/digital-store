import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP States
  const [otpToken, setOtpToken] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState(null);
  const [emailSentError, setEmailSentError] = useState('');

  const { sendOtp, verifyOtp, error, clearError, loading, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    if (isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate, clearError]);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password minimal 8 karakter";
    if (!/^[A-Z]/.test(pwd)) return "Password wajib diawali dengan huruf besar";
    if (!/\d/.test(pwd)) return "Password wajib mengandung angka";
    if (!/[@$!%*?&#\-_]/.test(pwd)) return "Password wajib mengandung simbol (@$!%*?&#-_)";
    return null;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    clearError();
    setEmailSentError('');
    
    const pwdError = validatePassword(password);
    if (pwdError) {
      useAuthStore.setState({ error: pwdError });
      return;
    }

    try {
      const data = await sendOtp(name, email, password);
      setOtpToken(data.otpToken);
      if (data.simulated) {
        setSimulatedOtp(data.simulatedOtp);
      }
      if (data.emailError) {
        setEmailSentError(data.emailError);
      }
    } catch (err) {
      // Error handled by store
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      return;
    }
    try {
      await verifyOtp(otpCode, otpToken);
    } catch (err) {
      // Error handled by store
    }
  };

  const handleBackToRegister = () => {
    setOtpToken(null);
    setOtpCode('');
    setSimulatedOtp(null);
    setEmailSentError('');
    clearError();
  };

  return (
    <div className="page auth-page container flex-center animate-fadeIn">
      <div className="auth-card glass">
        {!otpToken ? (
          <>
            <h1 className="text-center">Create Account</h1>
            <p className="auth-subtitle text-center">Join us and start managing your premium products</p>

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

            <form onSubmit={handleSendOtp} className="auth-form">
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
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@gmail.com"
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
                <small style={{ color: '#a0aec0', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Min 8 karakter, wajib diawali huruf besar, serta mengandung angka & simbol
                </small>
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
              </button>
            </form>

            <div className="auth-switch">
              <span>Already have an account?</span>
              <Link to="/login">Login Here</Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-center">Verify Email</h1>
            <p className="auth-subtitle text-center">
              We have sent a 6-digit verification code to <strong>{email}</strong>. Please check your inbox or spam folder.
            </p>

            {error && <div className="auth-error-alert">{error}</div>}
            
            {emailSentError && (
              <div className="auth-error-alert" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {emailSentError}
              </div>
            )}

            {simulatedOtp && (
              <div className="simulated-otp-box" style={{
                background: 'rgba(108, 99, 255, 0.1)',
                border: '1px dashed #6c63ff',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
                color: '#e2e8f0',
                fontSize: '0.9rem'
              }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#a3a0e2' }}>💡 Mode Simulasi (SMTP Belum Disetup)</span>
                Kode OTP Anda adalah: <strong style={{ fontSize: '1.2rem', color: '#6c63ff', letterSpacing: '2px' }}>{simulatedOtp}</strong>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="form-group">
                <label htmlFor="otpCode">6-Digit Verification Code (OTP)</label>
                <input
                  type="text"
                  id="otpCode"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  style={{
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    letterSpacing: '5px',
                    fontWeight: 'bold',
                    padding: '0.75rem'
                  }}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading || otpCode.length < 6}>
                {loading ? 'Verifying...' : 'Verify & Register Account'}
              </button>

              <button 
                type="button" 
                className="btn btn-secondary w-full" 
                onClick={handleBackToRegister} 
                style={{ marginTop: '0.75rem' }}
                disabled={loading}
              >
                Back / Change Email
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
