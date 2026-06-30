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
            <p className="auth-subtitle text-center">Register with your active email address to receive a verification OTP</p>

            {error && <div className="auth-error-alert">{error}</div>}

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
                  placeholder="e.g. john@example.com"
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
