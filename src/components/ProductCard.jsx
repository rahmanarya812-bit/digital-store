import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const isWish = isInWishlist(product.id);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="product-card glass animate-fadeIn" style={{ opacity: isOutOfStock ? 0.85 : 1 }}>
      {isOutOfStock ? (
        <span className="card-badge" style={{ background: 'var(--danger)', color: 'white' }}>Stok Habis</span>
      ) : (
        product.badge && <span className={`card-badge badge-${product.badge.toLowerCase()}`}>{product.badge}</span>
      )}
      <div className="product-image-wrapper">
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        <button
          className={`wishlist-btn ${isWish ? 'active' : ''}`}
          onClick={() => toggleItem(product)}
          aria-label={isWish ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <FiHeart size={18} fill={isWish ? "var(--danger)" : "none"} />
        </button>
      </div>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="product-meta">
          <div className="product-rating">
            <FiStar size={14} fill="var(--warning)" color="var(--warning)" />
            <span>{product.rating}</span>
            <span className="product-reviews">({product.reviews})</span>
          </div>
          <span 
            className="product-downloads" 
            style={{ 
              color: isOutOfStock ? 'var(--danger)' : product.stock < 5 ? 'var(--warning)' : 'var(--text-muted)',
              fontWeight: product.stock < 5 ? '600' : 'normal'
            }}
          >
            {isOutOfStock ? 'Habis' : product.stock < 5 ? `Sisa ${product.stock}` : `${product.downloads.toLocaleString()} dl`}
          </span>
        </div>
        <div className="product-footer">
          <div className="product-price-container">
            <span className="product-price">{formatPrice(product.price)}</span>
            {product.originalPrice && <span className="product-original-price">{formatPrice(product.originalPrice)}</span>}
          </div>
          <button 
            className="btn btn-sm add-cart-btn" 
            style={{ 
              background: isOutOfStock ? 'rgba(255, 255, 255, 0.05)' : 'var(--accent-gradient)',
              border: isOutOfStock ? '1px solid rgba(255, 107, 107, 0.3)' : 'none',
              color: isOutOfStock ? 'var(--danger)' : 'white',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              opacity: isOutOfStock ? 0.7 : 1
            }}
            disabled={isOutOfStock}
            onClick={() => !isOutOfStock && addItem(product)} 
            aria-label={isOutOfStock ? "Stok Habis" : "Add to Cart"}
          >
            <FiShoppingCart size={16} /> {isOutOfStock ? 'Habis' : 'Beli'}
          </button>
        </div>
      </div>
    </div>
  );
}
