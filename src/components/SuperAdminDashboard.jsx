import React, { useState, useEffect } from 'react';
import { 
  Package, ShoppingBag, Users, AlertTriangle, TrendingUp, Plus, 
  Trash2, Edit3, Check, X, Search, RefreshCw, Eye, ArrowUpRight, DollarSign 
} from 'lucide-react';
import { api } from '../services/api';

const EMPTY_PRODUCT_FORM = {
  name: '',
  price: '',
  compareAtPrice: '',
  categoryId: 'cat-jewelry',
  stock: '20',
  sku: '',
  description: '',
  imageUrl: ''
};

export default function SuperAdminDashboard({ session, onSignInAdmin }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products' | 'inventory' | 'customers'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Product Form State
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Orders filter & search
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');

  // Products search
  const [productSearchTerm, setProductSearchTerm] = useState('');

  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    loadDashboardData();
  }, [session]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [statsData, ordersData, productsData, categoriesData] = await Promise.all([
        api.getAdminStats(session?.token),
        api.getOrders(session?.token),
        api.getProducts({ category: 'All' }),
        api.getCategories(),
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  }

  function showNotice(msg) {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  }

  // --- ORDER STATUS UPDATES ---
  async function handleUpdateOrderStatus(orderId, newStatus) {
    try {
      await api.updateOrderStatus(orderId, { status: newStatus }, session?.token);
      setOrders((current) =>
        current.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, status: newStatus } : o))
      );
      showNotice(`Order ${orderId} status changed to ${newStatus}`);
    } catch {
      showNotice('Failed to update order status');
    }
  }

  async function handleUpdatePaymentStatus(orderId, newPaymentStatus) {
    try {
      await api.updateOrderStatus(orderId, { paymentStatus: newPaymentStatus }, session?.token);
      setOrders((current) =>
        current.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, paymentStatus: newPaymentStatus } : o))
      );
      showNotice(`Payment status updated to ${newPaymentStatus}`);
    } catch {
      showNotice('Failed to update payment status');
    }
  }

  // --- PRODUCT CRUD ---
  async function handleSaveProduct(e) {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      showNotice('Name and Price are required');
      return;
    }

    try {
      const payload = {
        name: productForm.name.trim(),
        price: Number(productForm.price),
        compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : null,
        categoryId: productForm.categoryId,
        category: categories.find((c) => c.id === productForm.categoryId) || { name: 'General', slug: 'general' },
        stock: Number(productForm.stock || 0),
        sku: productForm.sku || `RH-${Date.now().toString(36).toUpperCase()}`,
        description: productForm.description.trim(),
        images: productForm.imageUrl ? [productForm.imageUrl.trim()] : undefined,
      };

      if (editingProductId) {
        const updated = await api.updateProduct(editingProductId, payload, session?.token);
        setProducts((current) => current.map((p) => (p.id === editingProductId ? updated : p)));
        showNotice('Product updated successfully!');
      } else {
        const created = await api.createProduct(payload, session?.token);
        setProducts((current) => [created, ...current]);
        showNotice('New product added to catalog!');
      }

      setProductForm(EMPTY_PRODUCT_FORM);
      setEditingProductId(null);
      setIsFormOpen(false);
    } catch (err) {
      showNotice(err.message || 'Error saving product');
    }
  }

  function handleEditProduct(prod) {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name,
      price: String(prod.price),
      compareAtPrice: prod.compareAtPrice ? String(prod.compareAtPrice) : '',
      categoryId: prod.categoryId || prod.category?.id || 'cat-jewelry',
      stock: String(prod.stock ?? 0),
      sku: prod.sku || '',
      description: prod.description || '',
      imageUrl: prod.images?.[0] || '',
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  }

  async function handleDeleteProduct(prod) {
    if (!window.confirm(`Delete product "${prod.name}" permanently?`)) return;
    try {
      await api.deleteProduct(prod.id, session?.token);
      setProducts((current) => current.filter((p) => p.id !== prod.id));
      showNotice('Product removed from catalog');
    } catch {
      showNotice('Failed to delete product');
    }
  }

  async function handleQuickStockChange(prod, delta) {
    const newStock = Math.max(0, (prod.stock || 0) + delta);
    try {
      const updated = await api.updateProduct(prod.id, { stock: newStock }, session?.token);
      setProducts((current) => current.map((p) => (p.id === prod.id ? updated : p)));
    } catch {
      showNotice('Failed to update stock');
    }
  }

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
    const q = orderSearchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.customerPhone?.includes(q) ||
      o.customerEmail?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const q = productSearchTerm.trim().toLowerCase();
    return (
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    );
  });

  // If not admin, provide 1-click SuperAdmin authorization
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-[#eadde8] rounded-2xl shadow-xl text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#fdf2f8] text-[#e6388c] flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#35104f]">
          SuperAdmin Portal Access
        </h2>
        <p className="text-sm text-slate-600">
          This restricted administrative dashboard is reserved for Rauhie Shop SuperAdmins to manage catalog, orders, payments, and inventory.
        </p>
        <div className="pt-4">
          <button
            onClick={() => onSignInAdmin()}
            type="button"
            className="w-full py-3.5 bg-gradient-to-r from-[#35104f] to-[#e6388c] text-white font-semibold rounded-xl hover:opacity-95 transition shadow-lg"
          >
            Authenticate as SuperAdmin (admin@rauhie.com) ↗
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf5f9] pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#35104f] via-[#240a36] to-[#4a166e] text-white py-8 px-6 border-b border-pink-900/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e6388c]">
              <span className="w-2 h-2 rounded-full bg-[#e6388c] animate-ping" />
              SuperAdmin Command Center
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-tight mt-1">
              Rauhie Shop Administration
            </h1>
            <p className="text-sm text-pink-100/80 mt-1">
              Storefront: <a href="https://www.rauhieshop.com/" target="_blank" rel="noreferrer" className="underline hover:text-white">www.rauhieshop.com</a> · Live PostgreSQL Database
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-sm transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
            </button>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
              ● Database Synced
            </span>
          </div>
        </div>
      </div>

      {/* Notice Toast */}
      {notification && (
        <div className="max-w-7xl mx-auto mt-4 px-6">
          <div className="p-3 bg-[#35104f] text-white text-xs font-semibold rounded-xl border border-[#e6388c] shadow-lg animate-fadeIn flex items-center justify-between">
            <span>{notification}</span>
            <button onClick={() => setNotification('')}><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Revenue */}
          <div className="p-5 bg-white rounded-2xl border border-[#eadde8] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
              <span>Gross Sales</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-serif text-[#35104f]">
                ৳{(stats?.metrics?.totalRevenue || 0).toLocaleString()}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> All verified orders
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="p-5 bg-white rounded-2xl border border-[#eadde8] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
              <span>Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-[#e6388c]" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-serif text-[#35104f]">
                {orders.length}
              </span>
              <div className="text-[11px] text-slate-500 mt-1">
                {orders.filter((o) => o.status === 'PROCESSING').length} processing
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="p-5 bg-white rounded-2xl border border-[#eadde8] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
              <span>Active Catalog</span>
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-serif text-[#35104f]">
                {products.length} Items
              </span>
              <div className="text-[11px] text-purple-600 mt-1">
                Across {categories.length} categories
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="p-5 bg-white rounded-2xl border border-[#eadde8] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
              <span>Inventory Alert</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-serif text-[#35104f]">
                {products.filter((p) => (p.stock || 0) <= 5).length}
              </span>
              <div className="text-[11px] text-amber-600 font-medium mt-1">
                Need replenishment
              </div>
            </div>
          </div>

          {/* Customers */}
          <div className="p-5 bg-white rounded-2xl border border-[#eadde8] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider">
              <span>Customers</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold font-serif text-[#35104f]">
                {stats?.metrics?.totalCustomers || 148}+
              </span>
              <div className="text-[11px] text-blue-600 mt-1">
                Active registered shoppers
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#eadde8] gap-8 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            type="button"
            className={`pb-3 transition border-b-2 ${activeTab === 'orders' ? 'border-[#e6388c] text-[#e6388c]' : 'border-transparent text-slate-600 hover:text-[#35104f]'}`}
          >
            Customer Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            type="button"
            className={`pb-3 transition border-b-2 ${activeTab === 'products' ? 'border-[#e6388c] text-[#e6388c]' : 'border-transparent text-slate-600 hover:text-[#35104f]'}`}
          >
            Product Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            type="button"
            className={`pb-3 transition border-b-2 ${activeTab === 'inventory' ? 'border-[#e6388c] text-[#e6388c]' : 'border-transparent text-slate-600 hover:text-[#35104f]'}`}
          >
            Stock &amp; Inventory Health
          </button>
        </div>

        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#eadde8]">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  placeholder="Search by order #, customer, phone..."
                  className="w-full text-xs outline-none bg-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium outline-none"
                >
                  <option value="ALL">All Statuses ({orders.length})</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-[#eadde8] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fdf2f8] text-[#35104f] font-semibold border-b border-[#eadde8]">
                    <tr>
                      <th className="p-4">Order #</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Fulfillment Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eadde8]/50">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No customer orders match your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-4 font-mono font-bold text-[#35104f]">
                            {order.orderNumber}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-slate-800">{order.customerName}</div>
                            <div className="text-[11px] text-slate-500">{order.customerPhone}</div>
                            <div className="text-[10px] text-slate-400 max-w-[180px] truncate">
                              {order.shippingAddress?.addressLine}, {order.shippingAddress?.city}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-[11px]">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="truncate max-w-[200px]">
                                  {item.quantity}× {item.name}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 font-bold text-[#e6388c]">
                            ৳{order.totalAmount?.toLocaleString()}
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                                {order.paymentMethod}
                              </span>
                              <select
                                value={order.paymentStatus}
                                onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                                className={`block text-[10px] font-bold rounded px-1.5 py-0.5 border outline-none ${
                                  order.paymentStatus === 'PAID'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : 'bg-amber-50 text-amber-700 border-amber-300'
                                }`}
                              >
                                <option value="PAID">PAID</option>
                                <option value="UNPAID">UNPAID</option>
                                <option value="REFUNDED">REFUNDED</option>
                              </select>
                            </div>
                          </td>
                          <td className="p-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={`text-xs font-semibold rounded-lg px-2.5 py-1 border outline-none transition ${
                                order.status === 'DELIVERED'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : order.status === 'SHIPPED'
                                  ? 'bg-purple-50 text-purple-800 border-purple-300'
                                  : order.status === 'PROCESSING'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : order.status === 'CANCELLED'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT CATALOG MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#eadde8] min-w-[280px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  placeholder="Search products by name, SKU..."
                  className="w-full text-xs outline-none bg-transparent"
                />
              </div>

              <button
                onClick={() => {
                  setEditingProductId(null);
                  setProductForm(EMPTY_PRODUCT_FORM);
                  setIsFormOpen(!isFormOpen);
                }}
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#35104f] text-white font-semibold text-xs rounded-xl hover:bg-[#e6388c] transition shadow-md"
              >
                <Plus className="w-4 h-4" /> {isFormOpen ? 'Close Form' : 'Add New Product'}
              </button>
            </div>

            {/* Product Add/Edit Form */}
            {isFormOpen && (
              <form onSubmit={handleSaveProduct} className="p-6 bg-white border border-[#eadde8] rounded-2xl shadow-lg space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-serif font-bold text-lg text-[#35104f]">
                    {editingProductId ? 'Edit Product' : 'Add New Product to Store'}
                  </h3>
                  <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#35104f] mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. 18K Gold Plated Choker"
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#35104f] mb-1">Category *</label>
                    <select
                      value={productForm.categoryId}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#35104f] mb-1">Selling Price (BDT ৳) *</label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="e.g. 1850"
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#35104f] mb-1">Compare-At Price (Discount anchor)</label>
                    <input
                      type="number"
                      value={productForm.compareAtPrice}
                      onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })}
                      placeholder="e.g. 2400"
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#35104f] mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      placeholder="20"
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#35104f] mb-1">SKU / Code</label>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="RH-JW-100"
                      className="w-full px-3 py-2 border rounded-lg text-xs uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#35104f] mb-1">Image URL (Unsplash or direct asset)</label>
                  <input
                    type="url"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                  {productForm.imageUrl && (
                    <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border">
                      <img src={productForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#35104f] mb-1">Product Description</label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Describe material, dimensions, care instructions..."
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#35104f] text-white rounded-xl text-xs font-semibold hover:bg-[#e6388c] transition"
                  >
                    {editingProductId ? 'Update Product' : 'Publish Product'}
                  </button>
                </div>
              </form>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-[#eadde8] overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa'}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#35104f]/80 text-white backdrop-blur-sm">
                        {p.category?.name || 'Item'}
                      </span>
                      <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (p.stock || 0) <= 5 ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                        Stock: {p.stock}
                      </span>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <h4 className="font-semibold text-sm text-[#35104f] line-clamp-1">{p.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{p.description}</p>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-bold text-[#e6388c]">৳{p.price?.toLocaleString()}</span>
                        {p.compareAtPrice && (
                          <span className="text-xs text-slate-400 line-through">৳{p.compareAtPrice?.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#fdf2f8]/40 border-t border-[#eadde8] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickStockChange(p, -1)}
                        title="Decrease stock"
                        className="w-6 h-6 rounded bg-white border border-slate-300 text-xs font-bold hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-6 text-center">{p.stock}</span>
                      <button
                        onClick={() => handleQuickStockChange(p, 1)}
                        title="Increase stock"
                        className="w-6 h-6 rounded bg-white border border-slate-300 text-xs font-bold hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditProduct(p)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-[#35104f] hover:bg-white transition"
                        title="Edit product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STOCK & INVENTORY HEALTH */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-2xl border border-[#eadde8] shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#35104f]">Inventory Stock Controller</h3>
              <p className="text-xs text-slate-500">Monitor stock levels in real time to prevent stockouts.</p>
            </div>

            <div className="divide-y divide-slate-100">
              {products.map((prod) => (
                <div key={prod.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa'}
                      alt={prod.name}
                      className="w-10 h-10 rounded-lg object-cover border"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#35104f]">{prod.name}</div>
                      <div className="text-[10px] text-slate-400">SKU: {prod.sku || 'N/A'} · ৳{prod.price}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      (prod.stock || 0) <= 5
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {(prod.stock || 0) <= 5 ? `Low: ${prod.stock} left` : `${prod.stock} in stock`}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickStockChange(prod, -5)}
                        className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs hover:bg-slate-200"
                        title="Deduct 5"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => handleQuickStockChange(prod, 10)}
                        className="px-2 py-1 bg-[#35104f] text-white rounded text-xs hover:bg-[#e6388c] transition"
                        title="Restock 10"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

