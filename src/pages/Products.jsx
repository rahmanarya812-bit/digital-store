import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import './Products.css';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // States derived from URL searchParams
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'downloads';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Number(searchParams.get('page') || '1');

  useEffect(() => {
    setLoading(true);
    const params = {
      category,
      search,
      sort,
      minPrice,
      maxPrice,
      page,
      limit: 8
    };

    productService.getAll(params)
      .then((data) => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [category, search, sort, minPrice, maxPrice, page]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset page to 1 when filters change (except when changing page itself)
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="page products-page container">
      <div className="products-header animate-fadeIn">
        <h1 className="section-title">Digital Catalogue</h1>
        <p className="section-subtitle">Premium utilities, software, templates and study kits</p>
        <div className="products-search-wrapper">
          <SearchBar onSearch={(val) => updateParam('search', val)} initialValue={search} />
        </div>
      </div>

      <div className="products-layout">
        <FilterSidebar
          selectedCategory={category}
          onCategoryChange={(val) => updateParam('category', val)}
          selectedSort={sort}
          onSortChange={(val) => updateParam('sort', val)}
          minPrice={minPrice}
          onMinPriceChange={(val) => updateParam('minPrice', val)}
          maxPrice={maxPrice}
          onMaxPriceChange={(val) => updateParam('maxPrice', val)}
          onClearFilters={handleClearFilters}
        />

        <main className="products-content">
          <div className="products-results-bar">
            <span>Showing {products.length} of {total} products</span>
          </div>

          {loading ? (
            <div className="products-loading-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton product-card-skeleton" style={{ height: '380px' }}></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state glass">
              <span className="empty-state-icon">🔍</span>
              <h3>No products found</h3>
              <p>Try adjusting your search terms or filter constraints.</p>
              <button className="btn btn-primary" onClick={handleClearFilters}>Reset All Filters</button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page <= 1}
                    onClick={() => updateParam('page', page - 1)}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">Page {page} of {totalPages}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page >= totalPages}
                    onClick={() => updateParam('page', page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
