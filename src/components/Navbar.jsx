import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiLogOut, FiMenu, FiX, FiSearch, FiShield } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, toggleCart } = useCartStore();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar glass">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <img src="/logo.png" alt="Logo" className="brand-logo-img" />
          <span className="brand-text">Arya Store</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Beranda</Link>
          <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Produk</Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Kontak</Link>
          {isLoggedIn && <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Pesanan</Link>}
          {isLoggedIn && user?.role === 'admin' && (
            <Link to="/admin" className={`nav-link nav-link-admin ${isActive('/admin') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              <FiShield size={14} /> Admin
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          <form className={`search-form ${searchOpen ? 'active' : ''}`} onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>
          <button className="nav-icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            <FiSearch size={20} />
          </button>

          <Link to="/wishlist" className="nav-icon-btn">
            <FiHeart size={20} />
            {wishlistItems.length > 0 && <span className="icon-badge">{wishlistItems.length}</span>}
          </Link>

          <button className="nav-icon-btn" onClick={toggleCart} aria-label="Cart">
            <FiShoppingCart size={20} />
            {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
          </button>

          {isLoggedIn ? (
            <div className="user-menu">
              <button className="nav-icon-btn user-btn">
                <FiUser size={20} />
              </button>
              <div className="user-dropdown glass">
                <div className="user-info">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-email">{user?.email}</span>
                  <Link to="/profile" className="manage-account-btn">Kelola Akun Anda</Link>
                </div>
                <hr />
                <Link to="/orders" className="dropdown-item">Pesanan Saya</Link>
                <Link to="/wishlist" className="dropdown-item">Favorit</Link>
                {user?.role === 'admin' && <Link to="/admin" className="dropdown-item">Dashboard</Link>}
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  <FiLogOut size={16} /> Keluar
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm nav-login-btn">Masuk</Link>
          )}

          <button className="nav-icon-btn mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
