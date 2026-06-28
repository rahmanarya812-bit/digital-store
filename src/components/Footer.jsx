import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3><span className="brand-icon">⚡</span> Arya Store</h3>
            <p>Premium digital products marketplace. Software, courses, templates, and more for creators and developers.</p>
            <div className="footer-socials">
              <a href="#" aria-label="GitHub"><FiGithub size={18} /></a>
              <a href="#" aria-label="Twitter"><FiTwitter size={18} /></a>
              <a href="#" aria-label="Instagram"><FiInstagram size={18} /></a>
              <a href="https://wa.me/6285607492894" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><FaWhatsapp size={18} /></a>
              <a href="#" aria-label="Mail"><FiMail size={18} /></a>
            </div>
          </div>
          <div className="footer-links-col">
            <h4>Marketplace</h4>
            <Link to="/products?category=software">Software</Link>
            <Link to="/products?category=template">Templates</Link>
            <Link to="/products?category=course">Courses</Link>
            <Link to="/products?category=ebook">Ebooks</Link>
          </div>
          <div className="footer-links-col">
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
          <div className="footer-links-col">
            <h4>Newsletter</h4>
            <p>Subscribe to get the latest updates on new releases and discounts.</p>
            <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" required />
              <button type="submit" className="btn btn-primary btn-sm">Subscribe</button>
            </form>
          </div>
        </div>
        <hr className="footer-divider" />
        <div className="footer-bottom">
          <p>&copy; 2026 Arya Store. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
