import { getProducts, saveProducts } from '../_utils/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const products = await getProducts();

  // POST: Create a product
  if (req.method === 'POST') {
    const { 
      name, category, price, originalPrice, description, shortDesc, format, fileSize, stock,
      code, useVariations, stockForm, editStockMode, accountsStock, termsAndConditions, requireNote,
      cashbackType, cashbackValue, profit, bulkingMode, wholesaleTiers, isVisible, image
    } = req.body || {};

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, Category and Price are required' });
    }
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      description: description || 'No description provided.',
      shortDesc: shortDesc || name,
      format: format || 'Digital Download',
      fileSize: fileSize || 'Unknown',
      image: image || (category === 'software' ? '/products/software.jpg' : category === 'ebook' ? '/products/ebook.jpg' : category === 'template' ? '/products/template.jpg' : category === 'course' ? '/products/course.jpg' : category === 'plugin' ? '/products/plugin.jpg' : '/products/assets.jpg'),
      rating: 5.0,
      reviews: 0,
      downloads: 0,
      stock: stock !== undefined && stock !== '' ? Number(stock) : 99,
      badge: 'New',
      features: ['Instant Activation', 'Lifetime updates'],
      
      // New fields
      code: code || `PRD-${String(Date.now()).slice(-4)}`,
      useVariations: useVariations !== undefined ? Boolean(useVariations) : false,
      stockForm: stockForm || 'Manual',
      editStockMode: editStockMode !== undefined ? Boolean(editStockMode) : false,
      accountsStock: accountsStock || '',
      termsAndConditions: termsAndConditions || '',
      requireNote: requireNote || 'Tidak',
      cashbackType: cashbackType || 'Potongan Nominal',
      cashbackValue: cashbackValue !== undefined ? Number(cashbackValue) : 0,
      profit: profit !== undefined ? Number(profit) : 0,
      bulkingMode: bulkingMode !== undefined ? Number(bulkingMode) : 0,
      wholesaleTiers: wholesaleTiers || [],
      isVisible: isVisible !== undefined ? Boolean(isVisible) : true
    };
    products.push(newProduct);
    await saveProducts(products);
    return res.status(201).json({ product: newProduct });
  }

  // PUT: Edit a product
  if (req.method === 'PUT') {
    const { 
      id, name, category, price, originalPrice, description, shortDesc, format, fileSize, stock,
      code, useVariations, stockForm, editStockMode, accountsStock, termsAndConditions, requireNote,
      cashbackType, cashbackValue, profit, bulkingMode, wholesaleTiers, isVisible, image
    } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Product ID is required for editing' });
    
    const index = products.findIndex(p => p.id === Number(id));
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    
    products[index] = {
      ...products[index],
      name: name || products[index].name,
      category: category || products[index].category,
      price: price !== undefined ? Number(price) : products[index].price,
      originalPrice: originalPrice !== undefined ? (originalPrice ? Number(originalPrice) : null) : products[index].originalPrice,
      description: description || products[index].description,
      shortDesc: shortDesc || products[index].shortDesc,
      format: format || products[index].format,
      fileSize: fileSize || products[index].fileSize,
      stock: stock !== undefined && stock !== '' ? Number(stock) : products[index].stock,
      image: image !== undefined ? image : products[index].image,

      // New fields
      code: code !== undefined ? code : products[index].code,
      useVariations: useVariations !== undefined ? Boolean(useVariations) : products[index].useVariations,
      stockForm: stockForm !== undefined ? stockForm : products[index].stockForm,
      editStockMode: editStockMode !== undefined ? Boolean(editStockMode) : products[index].editStockMode,
      accountsStock: accountsStock !== undefined ? accountsStock : products[index].accountsStock,
      termsAndConditions: termsAndConditions !== undefined ? termsAndConditions : products[index].termsAndConditions,
      requireNote: requireNote !== undefined ? requireNote : products[index].requireNote,
      cashbackType: cashbackType !== undefined ? cashbackType : products[index].cashbackType,
      cashbackValue: cashbackValue !== undefined ? Number(cashbackValue) : products[index].cashbackValue,
      profit: profit !== undefined ? Number(profit) : products[index].profit,
      bulkingMode: bulkingMode !== undefined ? Number(bulkingMode) : products[index].bulkingMode,
      wholesaleTiers: wholesaleTiers !== undefined ? wholesaleTiers : products[index].wholesaleTiers,
      isVisible: isVisible !== undefined ? Boolean(isVisible) : products[index].isVisible
    };
    await saveProducts(products);
    return res.status(200).json({ product: products[index] });
  }

  // DELETE: Delete a product
  if (req.method === 'DELETE') {
    const { id } = req.query || {};
    if (!id) return res.status(400).json({ error: 'Product ID is required' });
    
    const index = products.findIndex(p => p.id === Number(id));
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    
    const deleted = products.splice(index, 1);
    await saveProducts(products);
    return res.status(200).json({ success: true, product: deleted[0] });
  }

  // GET: List/filter products
  if (req.method === 'GET') {
    let result = [...products];
    const { category, search, sort, minPrice, maxPrice, page = 1, limit = 12 } = req.query || {};

    if (category && category !== 'all') result = result.filter(p => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));

    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sort === 'newest') result.sort((a, b) => b.id - a.id);
    else result.sort((a, b) => b.downloads - a.downloads);

    const total = result.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const start = (pageNum - 1) * limitNum;
    const paged = result.slice(start, start + limitNum);

    return res.status(200).json({ products: paged, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
