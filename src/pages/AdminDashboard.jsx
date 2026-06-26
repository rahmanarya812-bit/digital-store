import { useEffect, useState } from 'react';
import { FiDownload, FiDollarSign, FiCpu, FiShoppingBag, FiActivity } from 'react-icons/fi';
import { adminService } from '../services/adminService';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedLog, setSimulatedLog] = useState('');
  
  // Tab control & CRUD state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('software');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodFileSize, setProdFileSize] = useState('');
  const [prodFormat, setProdFormat] = useState('');
  const [prodVersion, setProdVersion] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodStock, setProdStock] = useState('');

  const fetchStats = () => {
    adminService.getStats()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll({ limit: 100 });
      setProducts(data.products || []);
    } catch (err) {
      console.error('Fetch products error:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!isSimulating) {
      setSimulatedLog('');
      return;
    }

    const interval = setInterval(async () => {
      try {
        const prodData = await productService.getAll();
        const productsList = prodData.products;
        if (!productsList || productsList.length === 0) return;

        const randomProduct = productsList[Math.floor(Math.random() * productsList.length)];
        const names = ['Agus Prasetyo', 'Siti Aminah', 'Rudi Hermawan', 'Diana Lestari', 'Joko Susilo', 'Rina Wulandari'];
        const randomName = names[Math.floor(Math.random() * names.length)];

        const mockItems = [{
          productId: randomProduct.id,
          name: randomProduct.name,
          price: randomProduct.price,
          quantity: 1
        }];

        await orderService.create(mockItems, randomProduct.price);

        const updatedStats = await adminService.getStats();
        
        const simulatedOrder = {
          id: Math.floor(Math.random() * 1000) + 2000,
          customer: randomName,
          product: randomProduct.name,
          amount: randomProduct.price,
          status: 'completed',
          date: new Date().toISOString().split('T')[0]
        };

        updatedStats.recentOrders = [simulatedOrder, ...updatedStats.recentOrders].slice(0, 5);
        setStats(updatedStats);

        setSimulatedLog(`⚡ Simulated order placed: ${randomProduct.name} bought by ${randomName}`);
      } catch (err) {
        console.error('Simulate order error:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory('software');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdFileSize('');
    setProdFormat('');
    setProdVersion('');
    setProdDescription('');
    setProdStock('99');
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdPrice(prod.price);
    setProdOriginalPrice(prod.originalPrice || '');
    setProdFileSize(prod.fileSize || '');
    setProdFormat(prod.format || '');
    setProdVersion(prod.version || '');
    setProdDescription(prod.description || '');
    setProdStock(prod.stock !== undefined ? String(prod.stock) : '99');
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.delete(id);
      fetchProducts();
      fetchStats();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const data = {
      name: prodName,
      category: prodCategory,
      price: Number(prodPrice),
      originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : null,
      fileSize: prodFileSize,
      format: prodFormat,
      version: prodVersion,
      description: prodDescription,
      stock: prodStock !== '' ? Number(prodStock) : 99
    };

    try {
      if (editingProduct) {
        await productService.update({ id: editingProduct.id, ...data });
      } else {
        await productService.create(data);
      }
      setIsModalOpen(false);
      fetchProducts();
      fetchStats();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    }
  };

  if (loading || !stats) {
    return (
      <div className="page admin-dashboard container">
        <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }}></div>
      </div>
    );
  }

  return (
    <div className="page admin-dashboard container animate-fadeIn">
      <h1 className="section-title">Admin Dashboard</h1>
      <p className="section-subtitle">Real-time digital shop sales and system telemetry</p>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📈 Stats & Telemetry
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Manage Products (CRUD)
        </button>
      </div>

       {activeTab === 'dashboard' ? (
        <>
          {/* Stock Alerts Section */}
          {products.some(p => p.stock <= 3) && (
            <div className="stock-alerts-banner glass" style={{ borderLeft: '4px solid var(--danger)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255, 107, 107, 0.03)' }}>
              <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1rem', fontWeight: '700' }}>
                ⚠️ Peringatan Ketersediaan Stok
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Produk berikut telah habis atau mendekati batas kritis. Silakan perbarui stok lisensi digital Anda:</p>
              <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {products.filter(p => p.stock <= 3).map(p => (
                  <li key={p.id} style={{ marginBottom: '0.35rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{p.name}</strong> — {p.stock === 0 ? <span style={{ color: 'var(--danger)', fontWeight: '700' }}>STOK HABIS</span> : `Tersisa ${p.stock} lisensi.`}
                    <button 
                      onClick={() => {
                        setActiveTab('products');
                        openEditModal(p);
                      }} 
                      style={{ 
                        background: 'transparent', 
                        color: 'var(--accent-secondary)', 
                        border: 'none', 
                        padding: '0 0.5rem', 
                        cursor: 'pointer', 
                        textDecoration: 'underline', 
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      Update Stok &rarr;
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Auto Order Simulator Control */}
          <div className="simulator-control-bar glass">
            <div className="simulator-info">
              <h3><FiActivity className={isSimulating ? 'pulse-icon' : ''} /> Auto Order Simulator</h3>
              <p>
                {isSimulating 
                  ? simulatedLog || 'Waiting for simulated transaction...' 
                  : 'Turn on simulation to generate random orders in real-time for testing.'}
              </p>
            </div>
            <button 
              className={`btn ${isSimulating ? 'btn-danger' : 'btn-primary'}`} 
              onClick={() => setIsSimulating(!isSimulating)}
            >
              {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
            </button>
          </div>

          {/* Grid Stats */}
          <div className="admin-stats-grid">
            <div className="stat-card glass">
              <div className="stat-card-icon-wrapper cyan">
                <FiCpu size={24} />
              </div>
              <div>
                <span className="stat-card-label">Total Products</span>
                <h3>{stats.totalProducts}</h3>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-card-icon-wrapper purple">
                <FiDownload size={24} />
              </div>
              <div>
                <span className="stat-card-label">Total Downloads</span>
                <h3>{stats.totalDownloads.toLocaleString()}</h3>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-card-icon-wrapper green">
                <FiDollarSign size={24} />
              </div>
              <div>
                <span className="stat-card-label">Est. Revenue</span>
                <h3>{formatPrice(stats.totalRevenue)}</h3>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-card-icon-wrapper coral">
                <FiShoppingBag size={24} />
              </div>
              <div>
                <span className="stat-card-label">Total Orders</span>
                <h3>{stats.totalOrders}</h3>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            {/* Top Products */}
            <div className="dashboard-section glass">
              <h2>🔥 Top Products</h2>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th className="text-center">Downloads</th>
                      <th className="text-right">Est. Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts.map(prod => (
                      <tr key={prod.id}>
                        <td>{prod.name}</td>
                        <td className="text-center">{prod.downloads.toLocaleString()}</td>
                        <td className="text-right">{formatPrice(prod.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="dashboard-section glass">
              <h2>📦 Recent Activation Requests</h2>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th className="text-right">Amount</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.product}</td>
                        <td className="text-right">{formatPrice(order.amount)}</td>
                        <td className="text-center">
                          <span className={`status-badge badge-${order.status}`}>{order.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Products CRUD Panel */
        <div className="products-mgmt-panel glass animate-fadeIn">
          <div className="mgmt-header">
            <h2>Product Directory</h2>
            <button className="btn btn-primary" onClick={openCreateModal}>
              ➕ Create New Product
            </button>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th className="text-center">Version</th>
                  <th className="text-right">Price</th>
                  <th className="text-center">Stock</th>
                  <th className="text-center">Downloads</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">No products available. Add some!</td>
                  </tr>
                ) : (
                  products.map(prod => (
                    <tr key={prod.id}>
                      <td>
                        <div className="table-prod-info">
                          <strong>{prod.name}</strong>
                          <span className="table-prod-sub">Size: {prod.fileSize || 'N/A'} | Format: {prod.format || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="capitalize">{prod.category}</td>
                      <td className="text-center">{prod.version || '1.0.0'}</td>
                      <td className="text-right">{formatPrice(prod.price)}</td>
                      <td className="text-center" style={{ color: prod.stock === 0 ? 'var(--danger)' : prod.stock < 5 ? 'var(--warning)' : 'var(--text-primary)', fontWeight: '600' }}>
                        {prod.stock !== undefined ? prod.stock : 'N/A'}
                      </td>
                      <td className="text-center">{prod.downloads.toLocaleString()}</td>
                      <td className="text-center">
                        <div className="action-buttons">
                          <button className="btn btn-secondary btn-sm edit-btn-mgmt" onClick={() => openEditModal(prod)}>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(prod.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h2>{editingProduct ? '📝 Edit Product' : '➕ Create New Product'}</h2>
            <form onSubmit={handleSaveProduct} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" required value={prodName} onChange={e => setProdName(e.target.value)} placeholder="e.g. Photoshop Pro extension" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={prodCategory} onChange={e => setProdCategory(e.target.value)}>
                    <option value="software">Software</option>
                    <option value="ebook">Ebook</option>
                    <option value="template">Template</option>
                    <option value="course">Course</option>
                    <option value="plugin">Plugin</option>
                    <option value="asset">Digital Asset</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (Rp)</label>
                  <input type="number" required value={prodPrice} onChange={e => setProdPrice(e.target.value)} placeholder="Price in Rupiah" />
                </div>
                <div className="form-group">
                  <label>Original Price (Rp, Optional)</label>
                  <input type="number" value={prodOriginalPrice} onChange={e => setProdOriginalPrice(e.target.value)} placeholder="Original Price" />
                </div>
                <div className="form-group">
                  <label>File Size</label>
                  <input type="text" value={prodFileSize} onChange={e => setProdFileSize(e.target.value)} placeholder="e.g. 45 MB, 1.2 GB" />
                </div>
                <div className="form-group">
                  <label>Format</label>
                  <input type="text" value={prodFormat} onChange={e => setProdFormat(e.target.value)} placeholder="e.g. ZIP, PDF, Installer" />
                </div>
                <div className="form-group">
                  <label>Version</label>
                  <input type="text" value={prodVersion} onChange={e => setProdVersion(e.target.value)} placeholder="e.g. 1.0.0, 3.2" />
                </div>
                <div className="form-group">
                  <label>Stock / Stok Kuantitas</label>
                  <input type="number" required value={prodStock} onChange={e => setProdStock(e.target.value)} placeholder="e.g. 10, 50, 0" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={prodDescription} onChange={e => setProdDescription(e.target.value)} placeholder="Details description of the product..."></textarea>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Save Product</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
