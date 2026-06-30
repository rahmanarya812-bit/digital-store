import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { FiUser, FiPhone, FiLock, FiShield, FiSave, FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';
import './Profile.css';

export default function Profile() {
  const { user, sendProfileOtp, updateProfile } = useAuthStore();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpToken, setOtpToken] = useState(null);
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!name) {
      return setError('Nama tidak boleh kosong');
    }

    if (newPassword && newPassword.length < 6) {
      return setError('Password baru minimal 6 karakter');
    }

    setLoading(true);

    try {
      if (newPassword) {
        // Require OTP for password change
        const res = await sendProfileOtp(newPassword);
        setOtpToken(res.otpToken);
        if (res.simulatedOtp) {
          setSimulatedOtp(res.simulatedOtp);
        } else {
          setSimulatedOtp(null);
        }
        setShowOtpModal(true);
        setLoading(false);
      } else {
        // Just update profile (name, phone) directly
        await updateProfile({ name, phone });
        setMessage('Profil berhasil diperbarui!');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Terjadi kesalahan');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return setError('Masukkan kode OTP');
    
    setLoading(true);
    setError('');
    
    try {
      await updateProfile({ name, phone, otpToken, otp });
      setShowOtpModal(false);
      setNewPassword('');
      setOtp('');
      setMessage('Profil dan password berhasil diperbarui!');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'OTP tidak valid');
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            <FiUser size={40} />
          </div>
          <div>
            <h1>Pengaturan Akun</h1>
            <p>Kelola informasi data diri dan keamanan akun Anda</p>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar glass">
            <div className="security-status">
              <h3>Status Keamanan</h3>
              <div className="status-item active">
                <FiShield size={20} />
                <div>
                  <h4>2FA Aktif</h4>
                  <p>Verifikasi OTP Email</p>
                </div>
                <FiCheck className="status-icon success" />
              </div>
              <p className="security-note">
                Akun Anda dilindungi dengan sistem OTP. Perubahan kata sandi akan selalu membutuhkan konfirmasi dari email aktif Anda.
              </p>
            </div>
          </div>

          <div className="profile-main glass">
            {message && <div className="alert alert-success">{message}</div>}
            {error && !showOtpModal && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Alamat Email</label>
                <div className="input-group disabled">
                  <input type="email" value={user?.email || ''} disabled />
                  <span className="input-note">Email tidak dapat diubah</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <div className="input-with-icon">
                    <FiUser className="input-icon" />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Nomor Telepon</label>
                  <div className="input-with-icon">
                    <FiPhone className="input-icon" />
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="Contoh: 081234567890"
                    />
                  </div>
                </div>
              </div>

              <hr className="divider" />

              <div className="form-group">
                <label>Ubah Kata Sandi</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Kosongkan jika tidak ingin mengubah sandi"
                  />
                </div>
                {newPassword && (
                  <p className="input-help warning">
                    <FiAlertCircle /> Anda akan diminta memasukkan kode OTP untuk mengonfirmasi perubahan sandi.
                  </p>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Menyimpan...' : <><FiSave /> Simpan Perubahan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal-content glass otp-modal">
            <button className="modal-close" onClick={() => setShowOtpModal(false)}>
              <FiX />
            </button>
            <div className="otp-header">
              <div className="otp-icon-wrapper">
                <FiShield size={32} />
              </div>
              <h2>Verifikasi Keamanan</h2>
              <p>Kami telah mengirimkan kode OTP ke email <strong>{user?.email}</strong> untuk mengonfirmasi perubahan sandi.</p>
            </div>

            {simulatedOtp && (
              <div className="alert alert-warning simulation-alert">
                <strong>Simulasi SMTP Aktif:</strong><br/>
                Kode OTP Anda: <span style={{fontSize:'1.2rem', fontWeight:'bold', letterSpacing:'2px'}}>{simulatedOtp}</span>
              </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <input
                  type="text"
                  className="otp-input"
                  placeholder="Masukkan 6 Digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Memverifikasi...' : 'Verifikasi & Simpan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
