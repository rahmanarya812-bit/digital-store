import { FiGrid, FiCpu, FiBookOpen, FiLayout, FiVideo, FiCodesandbox, FiActivity } from 'react-icons/fi';
import './FilterSidebar.css';

const CATEGORIES = [
  { value: 'all', label: 'Semua Kategori', icon: <FiGrid size={16} /> },
  { value: 'software', label: 'Software', icon: <FiCpu size={16} /> },
  { value: 'ebook', label: 'Ebook', icon: <FiBookOpen size={16} /> },
  { value: 'template', label: 'Template', icon: <FiLayout size={16} /> },
  { value: 'course', label: 'Kursus', icon: <FiVideo size={16} /> },
  { value: 'plugin', label: 'Plugin', icon: <FiCodesandbox size={16} /> },
  { value: 'asset', label: 'Asset Digital', icon: <FiActivity size={16} /> }
];

const SORTS = [
  { value: 'downloads', label: 'Terpopuler' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga: Terendah ke Tertinggi' },
  { value: 'price_desc', label: 'Harga: Tertinggi ke Terendah' },
  { value: 'rating', label: 'Rating Tertinggi' }
];

export default function FilterSidebar({
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  onClearFilters
}) {
  return (
    <aside className="filter-sidebar glass">
      <div className="filter-section">
        <h3>Kategori</h3>
        <div className="category-list">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat.value)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Urutkan</h3>
        <select value={selectedSort} onChange={(e) => onSortChange(e.target.value)} className="filter-select">
          {SORTS.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <h3>Rentang Harga</h3>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min Rp"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="price-input"
          />
          <span className="price-separator">-</span>
          <input
            type="number"
            placeholder="Max Rp"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="price-input"
          />
        </div>
      </div>

      <button className="btn btn-secondary w-full clear-filters-btn" onClick={onClearFilters}>
        Bersihkan Filter
      </button>
    </aside>
  );
}
