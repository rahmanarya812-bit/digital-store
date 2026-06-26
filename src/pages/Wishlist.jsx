import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import './Wishlist.css';

export default function Wishlist() {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const handleMoveToCart = (product) => {
    addItem(product);
    removeItem(product.id);
  };

  return (
    <div className="page wishlist-page container animate-fadeIn">
      <h1 className="section-title">Your Wishlist</h1>
      <p className="section-subtitle">Manage your saved products and move them to cart</p>

      {items.length === 0 ? (
        <div className="empty-state glass">
          <span className="empty-state-icon">❤️</span>
          <h3>Your wishlist is empty</h3>
          <p>Find premium software or courses and click the heart icon to save them here.</p>
          <Link to="/products" className="btn btn-primary">Discover Products</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => (
            <div key={item.id} className="wishlist-item glass">
              <img src={item.image} alt={item.name} className="wishlist-item-img" />
              <div className="wishlist-item-info">
                <span className="wishlist-item-category">{item.category}</span>
                <h3>
                  <Link to={`/products/${item.id}`}>{item.name}</Link>
                </h3>
                <div className="wishlist-item-price-box">
                  <span className="wishlist-item-price">{formatPrice(item.price)}</span>
                </div>
              </div>
              <div className="wishlist-item-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleMoveToCart(item)}>
                  <FiShoppingCart size={14} /> Move to Cart
                </button>
                <button className="btn btn-secondary btn-sm remove-wish-btn" onClick={() => removeItem(item.id)} aria-label="Remove">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
