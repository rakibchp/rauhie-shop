import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE = 'https://api.escuelajs.co/api/v1'

const EMPTY_FORM = {
  title: '',
  price: '',
  description: '',
  categoryId: '',
  imageUrl: '',
  stock: '0',
}

async function readResponse(response) {
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = Array.isArray(result.message) ? result.message.join(', ') : result.message
    throw new Error(message || `Request failed (${response.status})`)
  }
  return result
}

function AdminProductsPage({ session, stock, onStockChange, formatPrice }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [status, setStatus] = useState('loading')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (session?.user?.role !== 'admin') return undefined
    let active = true
    const headers = session.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
    Promise.all([
      fetch(`${API_BASE}/products?offset=0&limit=50`, { headers }).then(readResponse),
      fetch(`${API_BASE}/categories`).then(readResponse),
    ]).then(([productData, categoryData]) => {
      if (!active) return
      setProducts(Array.isArray(productData) ? productData : [])
      setCategories(Array.isArray(categoryData) ? categoryData : [])
      setStatus('ready')
    }).catch((requestError) => {
      if (!active) return
      setError(requestError.message || 'Could not load products.')
      setStatus('error')
    })
    return () => { active = false }
  }, [session])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function startEdit(product) {
    setEditingId(product.id)
    setForm({
      title: product.title || '',
      price: String(product.price ?? ''),
      description: product.description || '',
      categoryId: String(product.category?.id || ''),
      imageUrl: product.images?.[0] || '',
      stock: String(stock[product.id] ?? product.stock ?? 0),
    })
    setError('')
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  async function saveProduct(event) {
    event.preventDefault()
    setPending(true)
    setError('')
    setNotice('')
    const payload = {
      title: form.title.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      categoryId: Number(form.categoryId),
      images: [form.imageUrl.trim()],
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    }

    try {
      const response = await fetch(`${API_BASE}/products${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      const savedProduct = await readResponse(response)
      onStockChange(savedProduct.id, Number(form.stock))
      setProducts((current) => editingId
        ? current.map((product) => product.id === editingId ? savedProduct : product)
        : [savedProduct, ...current])
      setNotice(editingId ? 'Product updated.' : 'Product added.')
      setEditingId(null)
      setForm(EMPTY_FORM)
    } catch (requestError) {
      setError(requestError.message || 'Could not save product.')
    } finally {
      setPending(false)
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete “${product.title}”? This cannot be undone.`)) return
    setPending(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`${API_BASE}/products/${product.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      await readResponse(response)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      onStockChange(product.id, null)
      if (editingId === product.id) cancelEdit()
      setNotice('Product deleted.')
    } catch (requestError) {
      setError(requestError.message || 'Could not delete product.')
    } finally {
      setPending(false)
    }
  }

  if (session?.user?.role !== 'admin') {
    return <main className="admin-page section-wrap"><p className="eyebrow">Restricted area</p><h1>Admin access required.</h1><p className="account-intro">Product management is available only to accounts assigned the admin role.</p><Link className="primary-button" to="/account">Back to account <span aria-hidden="true">↗</span></Link></main>
  }

  return (
    <main className="admin-page section-wrap">
      <header className="admin-page-heading">
        <div><p className="eyebrow">Rauhie Shop · Admin</p><h1>Manage products.</h1></div>
        <span>{products.length} products</span>
      </header>
      <section className="admin-editor" aria-labelledby="product-editor-title">
        <h2 id="product-editor-title">{editingId ? 'Edit product' : 'Add a product'}</h2>
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-notice" role="status">{notice}</p>}
        <form className="product-admin-form" onSubmit={saveProduct}>
          <label>Product name<input name="title" required minLength={2} maxLength={120} value={form.title} onChange={updateField} /></label>
          <label>Price (BDT)<input name="price" type="number" min="0" step="0.01" required value={form.price} onChange={updateField} /></label>
          <label>Category<select name="categoryId" required value={form.categoryId} onChange={updateField}><option value="">Choose a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label>Image URL<input name="imageUrl" type="url" required value={form.imageUrl} onChange={updateField} /></label>
          <label className="admin-description-field">Description<textarea name="description" required minLength={5} value={form.description} onChange={updateField} /></label>
          <label>Demo stock quantity<input name="stock" type="number" min="0" step="1" required value={form.stock} onChange={updateField} /><span className="field-note">Stored in this browser; the product API has no stock field.</span></label>
          <div className="admin-form-actions"><button className="primary-button" type="submit" disabled={pending || categories.length === 0}>{pending ? 'Saving...' : editingId ? 'Save changes' : 'Add product'} <span aria-hidden="true">↗</span></button>{editingId && <button className="text-button" type="button" onClick={cancelEdit}>Cancel edit</button>}</div>
        </form>
      </section>
      <section className="admin-product-list" aria-labelledby="admin-products-title">
        <div className="admin-list-heading"><h2 id="admin-products-title">Products</h2><span>Choose a product to edit or delete</span></div>
        {status === 'loading' && <p className="admin-list-message">Loading products...</p>}
        {status === 'error' && <p className="form-error" role="alert">{error}</p>}
        {status === 'ready' && products.map((product) => (
          <article className="admin-product-row" key={product.id}>
            <img src={product.images?.[0]} alt="" onError={(event) => { event.currentTarget.style.visibility = 'hidden' }} />
            <div className="admin-product-info"><strong>{product.title}</strong><span>{product.category?.name || 'Uncategorized'} · {formatPrice(product.price)} · Stock {stock[product.id] ?? product.stock ?? 'not supplied'}</span></div>
            <div className="admin-row-actions"><button className="text-button" type="button" disabled={pending} onClick={() => startEdit(product)}>Edit</button><button className="text-button delete-product-button" type="button" disabled={pending} onClick={() => deleteProduct(product)}>Delete</button></div>
          </article>
        ))}
      </section>
    </main>
  )
}

export default AdminProductsPage