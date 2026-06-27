import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCpu, FiBookOpen, FiLayout, FiVideo, FiCodesandbox, FiActivity } from 'react-icons/fi';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import './Home.css';

const CATEGORY_ITEMS = [
  { slug: 'software', label: 'Software', icon: <FiCpu size={24} />, desc: 'AI engines and suites' },
  { slug: 'ebook', label: 'Ebooks', icon: <FiBookOpen size={24} />, desc: 'Tech & startup playbooks' },
  { slug: 'template', label: 'Templates', icon: <FiLayout size={24} />, desc: 'React, Vue & Figma kits' },
  { slug: 'course', label: 'Courses', icon: <FiVideo size={24} />, desc: 'Full-stack & AI learning' },
  { slug: 'plugin', label: 'Plugins', icon: <FiCodesandbox size={24} />, desc: 'WordPress optimization' },
  { slug: 'asset', label: 'Assets', icon: <FiActivity size={24} />, desc: 'Premium motion kits' },
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
          <span className="hero-tagline">⚡ Next-Gen Digital Marketplace</span>
          <h1 className="hero-title">
            Selamat Datang Di Marketplase <span className="text-glow">ARYA STORE</span> Menyediakan Kebutuhan Premium
          </h1>
          <p className="hero-desc">
            Kebutuhan Aplikasi premium , jasa joki tugas , jasa  editing , jasa Kebutuhan sosial Media
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore Products <FiArrowRight size={18} />
            </Link>
            <a href="#categories" className="btn btn-secondary btn-lg">Browse Categories</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-sphere"></div>
          <div className="floating-grid"></div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="categories-sec container">
        <h2 className="section-title text-center">Browse by Category</h2>
        <p className="section-subtitle text-center">Explore curated premium resources across high-end niches</p>
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
            <h2 className="section-title">Best Sellers</h2>
            <p className="section-subtitle">Our most popular premium digital products</p>
          </div>
          <Link to="/products" className="btn btn-secondary">
            View All <FiArrowRight size={16} />
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
            <h2>Ready to transform your code & design?</h2>
            <p>Sign up now to access special launching discounts and exclusive free digital assets weekly.</p>
            <Link to="/register" className="btn btn-primary">Create Free Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
