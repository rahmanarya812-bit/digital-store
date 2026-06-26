import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import './SearchBar.css';

export default function SearchBar({ onSearch, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form className="search-bar-form" onSubmit={handleSubmit}>
      <div className="search-input-container">
        <FiSearch className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search premium products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-bar-input"
        />
        <button type="submit" className="btn btn-primary search-bar-btn">Search</button>
      </div>
    </form>
  );
}
