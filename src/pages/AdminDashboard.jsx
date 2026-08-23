import { useEffect, useMemo, useState } from 'react'
import { collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/authStore'
import {
  emptyProductForm, formToProduct, formatPrice, getProductReadiness,
  normalizeProduct, PRICING_TYPES, PRODUCT_CATEGORIES, PRODUCT_STATUSES,
  PRODUCT_TYPES, productToForm, slugify,
} from '../data/productSchema'
import './AdminDashboard.css'

function AdminDashboard() {
  const { user, loginWithGoogle } = useAuth()
  const [accessStatus, setAccessStatus] = useState('idle')
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [formData, setFormData] = useState(emptyProductForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) { setAccessStatus('idle'); return undefined }
    let active = true
    setAccessStatus('checking')
    getDoc(doc(db, 'admins', user.uid)).then((snapshot) => {
      if (active) setAccessStatus(snapshot.data()?.role === 'admin' ? 'granted' : 'denied')
    }).catch((error) => {
      console.error('Admin access check failed:', error)
      if (active) setAccessStatus('denied')
    })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (accessStatus !== 'granted') return undefined
    setLoadingProducts(true)
    return onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map((item) => normalizeProduct(item.data(), item.id)).sort((a, b) => a.name.localeCompare(b.name)))
      setLoadingProducts(false)
    }, (error) => {
      console.error('Could not load admin products:', error)
      setMessage('Products could not be loaded. Check the Firestore rules and your admin role.')
      setLoadingProducts(false)
    })
  }, [accessStatus])

  const draftProduct = useMemo(() => formToProduct(formData), [formData])
  const readiness = getProductReadiness(draftProduct)
  const isPublishing = formData.status === 'published'
  const saleProduct = formData.productType === 'sale'

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value, ...(name === 'name' && !editingId ? { slug: slugify(value) } : {}) }))
    setMessage('')
  }

  const resetForm = (clearMessage = true) => {
    setFormData(emptyProductForm)
    setEditingId(null)
    if (clearMessage) setMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const product = formToProduct(formData)
    const duplicateSlug = products.some((item) => item.slug === product.slug && item.id !== editingId)
    const productReadiness = getProductReadiness(product)

    if (!product.slug) return setMessage('A URL slug is required.')
    if (duplicateSlug) return setMessage('This URL slug is already being used by another product.')
    if (product.status === 'published' && !productReadiness.ready) return setMessage(`Cannot publish yet. Add or correct: ${productReadiness.missing.join(', ')}.`)

    setSaving(true)
    setMessage('')
    try {
      const productRef = editingId ? doc(db, 'products', editingId) : doc(collection(db, 'products'))
      await setDoc(productRef, { ...product, ...(editingId ? {} : { createdAt: serverTimestamp() }), updatedAt: serverTimestamp() })
      setMessage(editingId ? 'Product updated successfully.' : 'Product added successfully.')
      resetForm(false)
    } catch (error) {
      console.error('Product save error:', error)
      setMessage('Product could not be saved. Check the Firestore rules and try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
    setFormData(productToForm(product))
    setEditingId(product.id)
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return
    try {
      await deleteDoc(doc(db, 'products', product.id))
      if (editingId === product.id) resetForm()
    } catch (error) {
      console.error('Product delete error:', error)
      setMessage('Product could not be deleted. Check the Firestore rules and try again.')
    }
  }

  if (!user) return <div className="admin-gate"><h1>Admin access required</h1><p>Sign in with your authorized Google account to manage products.</p><button onClick={loginWithGoogle} className="admin-login-btn">Sign in with Google</button></div>
  if (accessStatus === 'checking') return <div className="admin-gate"><p>Checking admin permission…</p></div>
  if (accessStatus !== 'granted') return <div className="admin-gate"><h1>Access denied</h1><p>{user.email} is not an ARIX admin. An owner must add this user to the Firestore <code>admins</code> collection first.</p></div>

  return <main className="admin-dashboard"><div className="admin-container">
    <div className="admin-page-heading"><div><h1>Product management</h1><p>Publish sale products only after their price, Gumroad URL, and content are complete. Web and SaaS products also need a demo; apps, software, and tools use screenshots. Gumroad handles payment and delivery.</p></div><span className="admin-role-badge">Admin</span></div>
    <div className="admin-layout"><section className="admin-form-card">
      <div className="admin-card-heading"><h2>{editingId ? 'Edit product' : 'Add product'}</h2>{editingId && <button type="button" onClick={resetForm}>Cancel edit</button>}</div>
      {message && <p className="admin-message" role="status">{message}</p>}
      {isPublishing && !readiness.ready && <p className="admin-readiness">Publishing is blocked until you add or correct: {readiness.missing.join(', ')}.</p>}
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-row"><Field label="Product name"><input name="name" value={formData.name} onChange={handleChange} /></Field><Field label="URL slug" hint="arix-invoice"><input name="slug" value={formData.slug} onChange={handleChange} /></Field></div>
        <div className="admin-form-row"><Field label="Status"><select name="status" value={formData.status} onChange={handleChange}>{PRODUCT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field><Field label="Product type"><select name="productType" value={formData.productType} onChange={handleChange}>{PRODUCT_TYPES.map((productType) => <option key={productType} value={productType}>{productType === 'sale' ? 'For sale' : 'Showcase'}</option>)}</select></Field></div>
        <Field label="Category"><select name="category" value={formData.category} onChange={handleChange}>{PRODUCT_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></Field>
        <Field label="Platforms" hint="Web, Windows, Android"><input name="platforms" value={formData.platforms} onChange={handleChange} /></Field>
        <Field label="Short description" hint="Used on the product card and search metadata"><textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows="2" /></Field>
        <Field label="Product overview"><textarea name="description" value={formData.description} onChange={handleChange} rows="4" /></Field>
        <Field label="Cover image URL" hint="Use a real product screenshot"><input type="url" name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="https://..." /></Field>
        <Field label="Screenshot gallery" hint="One screenshot URL per line"><textarea name="images" value={formData.images} onChange={handleChange} rows="3" placeholder="https://..." /></Field>
        <Field label="Features" hint="One feature per line"><textarea name="features" value={formData.features} onChange={handleChange} rows="3" /></Field>
        <Field label="Requirements" hint="One requirement per line"><textarea name="requirements" value={formData.requirements} onChange={handleChange} rows="2" /></Field>
        <Field label="What&apos;s included" hint="One item per line"><textarea name="included" value={formData.included} onChange={handleChange} rows="2" /></Field>
        <div className="admin-form-row"><Field label="Version"><input name="version" value={formData.version} onChange={handleChange} placeholder="1.0.0" /></Field><Field label="License"><input name="license" value={formData.license} onChange={handleChange} placeholder="Single-site commercial" /></Field></div>
        <Field label="FAQ" hint="One question and answer per line: Question | Answer"><textarea name="faq" value={formData.faq} onChange={handleChange} rows="3" /></Field>
        <Field label="Demo URL (only required for Web design / SaaS — use screenshots for apps/software instead)"><input type="url" name="demoUrl" value={formData.demoUrl} onChange={handleChange} placeholder="https://... (leave empty for Software, AI, Mobile apps, Tools)" /></Field>
        {saleProduct && <>
          <div className="admin-form-row"><Field label="Price (USD)" hint="Enter 20 or 29.99 — never cents"><input type="number" min="0.01" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder="29.99" /></Field><Field label="Currency"><input name="currency" maxLength="3" value={formData.currency} onChange={handleChange} /></Field></div>
          <Field label="Pricing model"><select name="pricingType" value={formData.pricingType} onChange={handleChange}>{PRICING_TYPES.map((pricingType) => <option key={pricingType} value={pricingType}>{pricingType}</option>)}</select></Field>
          <Field label="Gumroad checkout URL" hint="Use the direct Gumroad product URL"><input type="url" name="checkoutUrl" value={formData.checkoutUrl} onChange={handleChange} placeholder="https://gumroad.com/l/..." /></Field>
        </>}
        <label className="admin-checkbox"><input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} /> Feature this product on the home page</label>
        <button type="submit" className="admin-submit-btn" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save product' : 'Add product'}</button>
      </form>
    </section>
    <section className="admin-list-card"><h2>All products ({products.length})</h2>{loadingProducts ? <p className="admin-empty">Loading…</p> : products.length === 0 ? <p className="admin-empty">No products yet. Start with a draft and publish when it is ready.</p> : <div className="admin-product-list">{products.map((product) => { const productReadiness = getProductReadiness(product); return <article key={product.id} className="admin-product-item"><div className="admin-product-image">{product.coverImage ? <img src={product.coverImage} alt="" /> : <span>{product.name.slice(0, 2).toUpperCase()}</span>}</div><div className="admin-product-info"><h3>{product.name || 'Untitled product'}</h3><p><span className={`admin-status ${product.status}`}>{product.status}</span> {product.productType === 'showcase' ? 'showcase · Built by ARIX' : `${product.category} · ${formatPrice(product.pricing) || 'No price'}`}</p>{product.status === 'published' && !productReadiness.ready && <small>Not public: {productReadiness.missing.join(', ')}</small>}</div><div className="admin-product-actions"><button type="button" onClick={() => handleEdit(product)}>Edit</button><button type="button" onClick={() => handleDelete(product)} className="admin-delete-btn">Delete</button></div></article> })}</div>}</section>
    </div>
  </div></main>
}

function Field({ label, hint, children }) {
  return <label className="admin-form-group"><span>{label}</span>{hint && <small>{hint}</small>}{children}</label>
}

export default AdminDashboard
