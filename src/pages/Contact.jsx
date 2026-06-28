import { useState, useEffect } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './Contact.css';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      setShowToast(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="page contact-page container animate-fadeIn">
      {/* Floating Toast Notification in Top-Right */}
      {showToast && (
        <div 
          className="toast toast-success" 
          style={{ 
            position: 'fixed', 
            top: '90px', 
            right: '2rem', 
            bottom: 'auto',
            zIndex: 10001,
            boxShadow: 'var(--shadow-glow-lg)',
            border: '1px solid rgba(78, 203, 113, 0.3)',
            animation: 'slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <FiCheckCircle size={18} />
          <span>Pesan Berhasil Dikirim! Terima kasih atas masukan Anda.</span>
        </div>
      )}

      <div className="contact-container">
        <div className="contact-header text-center">
          <h1 className="section-title">Hubungi Kami</h1>
          <p className="section-subtitle">Ada pertanyaan, saran, atau kendala aktivasi lisensi? Kami siap membantu.</p>
        </div>

        <div className="contact-card glass">
          <h2>Kirim sebuah pesan</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="contact-form-grid">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama kamu"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email kamu"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                required
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis sebuah pesan..."
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary send-msg-btn" disabled={loading}>
              {loading ? 'Mengirim...' : 'KIRIM PESAN'}
            </button>
          </form>
        </div>

        {/* WhatsApp Direct Contact Section */}
        <div className="contact-whatsapp-card glass text-center">
          <h3>Hubungi via WhatsApp</h3>
          <p>Butuh bantuan cepat atau pertanyaan seputar produk? Hubungi kami langsung untuk respon instan.</p>
          <a 
            href="https://wa.me/6281234567890" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn whatsapp-direct-btn"
          >
            <FaWhatsapp size={20} /> Chat Sekarang
          </a>
        </div>
      </div>
    </div>
  );
}
