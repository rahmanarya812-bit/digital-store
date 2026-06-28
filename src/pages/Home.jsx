import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCpu, FiBookOpen, FiLayout, FiVideo, FiCodesandbox, FiActivity } from 'react-icons/fi';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import './Home.css';

const CATEGORY_ITEMS = [
  { slug: 'software', label: 'Software', icon: <FiCpu size={24} />, desc: 'Aplikasi AI & Tools Premium' },
  { slug: 'ebook', label: 'Ebook', icon: <FiBookOpen size={24} />, desc: 'Ebook & Panduan Digital' },
  { slug: 'template', label: 'Template', icon: <FiLayout size={24} />, desc: 'Template React, Vue & Figma' },
  { slug: 'course', label: 'Kursus', icon: <FiVideo size={24} />, desc: 'Kursus Full-Stack & AI' },
  { slug: 'plugin', label: 'Plugin', icon: <FiCodesandbox size={24} />, desc: 'Optimasi & Plugin WordPress' },
  { slug: 'asset', label: 'Asset', icon: <FiActivity size={24} />, desc: 'Asset Gerak & Desain Premium' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    productService.getAll({ sort: 'downloads', limit: 4 })
      .then((data) => {
        setFeatured(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page home-page">
      {/* Hero Section */}
      <section className="hero container">
        <div className="hero-content animate-fadeIn">
          <span className="hero-tagline">⚡ Marketplace Digital Generasi Baru</span>
          <h1 className="hero-title">
            Selamat Datang Di Marketplase <span className="text-glow">ARYA STORE</span> Menyediakan Kebutuhan Premium
          </h1>
          <p className="hero-desc">
            Kebutuhan Aplikasi premium , jasa joki tugas , jasa  editing , jasa Kebutuhan sosial Media
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Jelajahi Produk <FiArrowRight size={18} />
            </Link>
            <a href="#categories" className="btn btn-secondary btn-lg">Cari Kategori</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-sphere"></div>
          <div className="floating-grid"></div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="categories-sec container">
        <h2 className="section-title text-center">Cari Berdasarkan Kategori</h2>
        <p className="section-subtitle text-center">Jelajahi resource premium terbaik untuk kebutuhan digital Anda</p>
        <div className="categories-grid">
          {CATEGORY_ITEMS.map((cat) => (
            <div
              key={cat.slug}
              className="category-card glass"
              onClick={() => navigate(`/products?category=${cat.slug}`)}
            >
              <div className="category-icon-wrapper">{cat.icon}</div>
              <h3>{cat.label}</h3>
              <p>{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-sec container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Terlaris</h2>
            <p className="section-subtitle">Produk digital premium paling populer pilihan pelanggan</p>
          </div>
          <Link to="/products" className="btn btn-secondary">
            Lihat Semua <FiArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="products-loading-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton product-card-skeleton" style={{ height: '380px' }}></div>
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <section className="promo-banner container">
        <div className="promo-banner-inner glass">
          <div className="promo-content">
            <h2>Siap meningkatkan performa & desain Anda?</h2>
            <p>Daftar akun sekarang untuk mendapatkan diskon peluncuran spesial dan aset digital premium gratis mingguan.</p>
            <Link to="/register" className="btn btn-primary">Buat Akun Gratis</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
