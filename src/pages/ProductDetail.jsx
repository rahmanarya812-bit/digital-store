import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiFileText, FiDownload, FiCheckCircle } from 'react-icons/fi';
import { productService } from '../services/productService';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  useEffect(() => {
    setLoading(true);
    setError(null);
    productService.getById(id)
      .then((data) => {
        setProduct(data.product);
        setRelated(data.related || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Product not found');
        setLoading(false);
      });
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <div className="page product-detail-page container">
        <div className="skeleton" style={{ height: '500px', borderRadius: '16px', marginBottom: '2rem' }}></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page product-detail-page container">
        <div className="empty-state glass">
          <span className="empty-state-icon">⚠️</span>
          <h3>Error Produk</h3>
          <p>{error || 'Produk yang Anda cari tidak tersedia.'}</p>
          <Link to="/products" className="btn btn-primary">Kembali ke Katalog</Link>
        </div>
      </div>
    );
  }

  const isWish = isInWishlist(product.id);

  return (
    <div className="page product-detail-page container animate-fadeIn">
      <div className="detail-layout">
        <div className="detail-visual">
          <div className="detail-img-container glass">
            <img src={product.image} alt={product.name} className="detail-img" />
          </div>
        </div>

        <div className="detail-info">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className="detail-category" style={{ margin: 0 }}>{product.category}</span>
            {product.cashbackValue > 0 && (
              <span className="detail-cashback-badge">
                💰 Cashback {product.cashbackType === 'Persentase' ? `${product.cashbackValue}%` : formatPrice(product.cashbackValue)}
              </span>
            )}
          </div>
          <h1 className="detail-title">{product.name}</h1>
          <div className="detail-meta">
            <div className="detail-rating">
              <FiStar size={16} fill="var(--warning)" color="var(--warning)" />
              <span className="rating-val">{product.rating}</span>
              <span className="reviews-count">({product.reviews} ulasan)</span>
            </div>
            <div className="detail-stats">
              <span><FiDownload size={14} /> {product.downloads.toLocaleString()} unduhan</span>
              <span><FiFileText size={14} /> {product.fileSize}</span>
            </div>
          </div>

          <p className="detail-desc">{product.description}</p>

          <div className="detail-specs glass">
            <div className="spec-item">
              <span className="spec-label">Format</span>
              <span className="spec-val">{product.format}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Stok Tersedia</span>
              <span 
                className="spec-val" 
                style={{ 
                   color: product.stock === 0 ? 'var(--danger)' : product.stock < 5 ? 'var(--warning)' : 'var(--success)', 
                   fontWeight: '600' 
                }}
              >
                {product.stock === 0 ? 'Habis' : `${product.stock} Lisensi`}
              </span>
            </div>
          </div>

          {product.termsAndConditions && (
            <div className="detail-terms-box glass">
              <h4>📋 Syarat & Ketentuan Lisensi:</h4>
              <p>{product.termsAndConditions}</p>
            </div>
          )}

          <div className="detail-pricing-actions">
            <div className="detail-price-box">
              <span className="detail-price">{formatPrice(product.price)}</span>
              {product.originalPrice && <span className="detail-original-price">{formatPrice(product.originalPrice)}</span>}
            </div>

            {/* Wholesale Price Tiers Callout */}
            {product.wholesaleTiers && product.wholesaleTiers.length > 0 && (
              <div className="detail-wholesale-tiers glass">
                <h4>⭐ Harga Grosir (Beli Banyak Lebih Murah):</h4>
                <div className="detail-tiers-grid">
                  {product.wholesaleTiers.map((tier, idx) => (
                    <div key={idx} className="detail-tier-pill">
                      <span className="tier-qty">Beli {tier.minQty}+ pcs</span>
                      <span className="tier-price">{formatPrice(tier.price)}/pcs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-buttons">
              <button 
                className="btn btn-lg flex-1" 
                style={{
                  background: product.stock === 0 ? 'rgba(255, 255, 255, 0.05)' : 'var(--accent-gradient)',
                  border: product.stock === 0 ? '1px solid rgba(255, 107, 107, 0.3)' : 'none',
                  color: product.stock === 0 ? 'var(--danger)' : 'white',
                  cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                  opacity: product.stock === 0 ? 0.7 : 1
                }}
                disabled={product.stock === 0} 
                onClick={() => product.stock > 0 && addItem(product)}
              >
                <FiShoppingCart size={20} /> {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
              </button>
              <button
                className={`btn btn-secondary btn-lg wishlist-detail-btn ${isWish ? 'active' : ''}`}
                onClick={() => toggleItem(product)}
                aria-label="Wishlist"
              >
                <FiHeart size={20} fill={isWish ? "var(--danger)" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Checklist */}
      {product.features && product.features.length > 0 && (
        <section className="detail-features-sec">
          <h2 className="section-title">Fitur & Keunggulan</h2>
          <div className="features-checklist-grid">
            {product.features.map((feat, i) => (
              <div key={i} className="checklist-item glass">
                <FiCheckCircle size={18} className="checklist-icon" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <section className="related-products-sec">
          <h2 className="section-title">Produk Terkait</h2>
          <p className="section-subtitle">Pelanggan lain juga membeli produk ini</p>
          <div className="products-grid">
            {related.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
