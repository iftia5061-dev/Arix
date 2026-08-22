import { useEffect, useMemo, useState } from 'react'
import { collection, doc, getDoc, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/authStore'
import {
  emptyProductForm, formToAsset, formToProduct, formatPrice, getProductReadiness,
  normalizeProduct, PRICING_TYPES, PRODUCT_CATEGORIES, PRODUCT_STATUSES,
  PRODUCT_TYPES, productToForm, slugify,
} from '../data/productSchema'
import './AdminDashboard.css'

function AdminDashboard() {
  const { user, loginWithGoogle } = useAuth()
  const [accessStatus, setAccessStatus] = useState('idle')
  const [products, setProducts] = useState([])
  const [assets, setAssets] = useState({})
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
    const stopProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map((item) => normalizeProduct(item.data(), item.id)).sort((a, b) => a.name.localeCompare(b.name)))
      setLoadingProducts(false)
    }, (error) => {
      console.error('Could not load admin products:', error)
      setMessage('Products could not be loaded. Check the Firestore rules and your admin role.')
      setLoadingProducts(false)
    })
    const stopAssets = onSnapshot(collection(db, 'productAssets'), (snapshot) => {
      setAssets(Object.fromEntries(snapshot.docs.map((item) => [item.id, item.data()])))
    }, (error) => console.error('Could not load private product delivery settings:', error))
    return () => { stopProducts(); stopAssets() }
  }, [accessStatus])

  const draftProduct = useMemo(() => formToProduct(formData), [formData])
  const draftAsset = useMemo(() => formToAsset(formData) || {}, [formData])
  const readiness = getProductReadiness(draftProduct, draftAsset)
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
    const asset = formToAsset(formData)
    const duplicateSlug = products.some((item) => item.slug === product.slug && item.id !== editingId)
    const productReadiness = getProductReadiness(product, asset || {})
    if (!product.slug) return setMessage('A URL slug is required.')
    if (duplicateSlug) return setMessage('This URL slug is already being used by another product.')
    if (product.status === 'published' && !productReadiness.ready) return setMessage(`Cannot publish yet. Add: ${productReadiness.missing.join(', ')}.`)

    setSaving(true)
    setMessage('')
    try {
      const productRef = editingId ? doc(db, 'products', editingId) : doc(collection(db, 'products'))
      const assetRef = doc(db, 'productAssets', productRef.id)
      const batch = writeBatch(db)
      batch.set(productRef, { ...product, ...(editingId ? {} : { createdAt: serverTimestamp() }), updatedAt: serverTimestamp() })
      if (asset) batch.set(assetRef, { ...asset, updatedAt: serverTimestamp() })
      else if (editingId) batch.delete(assetRef)
      await batch.commit()
      setMessage(editingId ? 'Product updated successfully.' : 'Product added successfully.')
      resetForm(false)
    } catch (error) {
      console.error('Product save error:', error)
      setMessage('Product could not be saved. Check the Firestore rules and try again.')
    } finally { setSaving(false) }
  }

  const handleEdit = (product) => {
    setFormData(productToForm(product, assets[product.id]))
    setEditingId(product.id)
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete “${product.name}”? Existing order history remains, but customers will no longer see this product page. The private delivery configuration will be retained for past buyers.`)) return
    try {
      const batch = writeBatch(db)
      batch.delete(doc(db, 'products', product.id))
      await batch.commit()
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
    <div className="admin-page-heading"><div><h1>Product management</h1><p>Drafts stay private. A sale product can publish only with a real screenshot, demo, Gumroad checkout, price, and private delivery configuration.</p></div><span className="admin-role-badge">Admin</span></div>
    <div className="admin-layout"><section className="admin-form-card">
      <div className="admin-card-heading"><h2>{editingId ? 'Edit product' : 'Add product'}</h2>{editingId && <button type="button" onClick={resetForm}>Cancel edit</button>}</div>
      {message && <p className="admin-message" role="status">{message}</p>}
      {isPublishing && !readiness.ready && <p className="admin-readiness">Publishing is blocked until you add: {readiness.missing.join(', ')}.</p>}
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-row"><Field label="Product name" required><input name="name" value={formData.name} onChange={handleChange} required /></Field><Field label="URL slug" hint="arix-invoice"><input name="slug" value={formData.slug} onChange={handleChange} required /></Field></div>
        <div className="admin-form-row"><Field label="Status"><select name="status" value={formData.status} onChange={handleChange}>{PRODUCT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field><Field label="Product type"><select name="productType" value={formData.productType} onChange={handleChange}>{PRODUCT_TYPES.map((productType) => <option key={productType} value={productType}>{productType === 'sale' ? 'For sale' : 'Showcase'}</option>)}</select></Field></div>
        <Field label="Category"><select name="category" value={formData.category} onChange={handleChange}>{PRODUCT_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></Field>
        <Field label="Platforms" hint="Web, Windows, Android" required><input name="platforms" value={formData.platforms} onChange={handleChange} required /></Field>
        <Field label="Short description" hint="Used on the product card and search metadata" required><textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows="2" required /></Field>
        <Field label="Product overview" required><textarea name="description" value={formData.description} onChange={handleChange} rows="4" required /></Field>
        <Field label="Cover screenshot URL" hint="Required to publish; use a real 16:9 product screenshot" required><input type="url" name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="https://..." required /></Field>
        <Field label="Screenshot gallery" hint="One real screenshot URL per line"><textarea name="images" value={formData.images} onChange={handleChange} rows="3" placeholder="https://..." /></Field>
        <Field label="Features" hint="One feature per line"><textarea name="features" value={formData.features} onChange={handleChange} rows="3" /></Field>
        <Field label="Requirements" hint="One requirement per line"><textarea name="requirements" value={formData.requirements} onChange={handleChange} rows="2" /></Field>
        <Field label="What&apos;s included" hint="One item per line"><textarea name="included" value={formData.included} onChange={handleChange} rows="2" /></Field>
        <div className="admin-form-row"><Field label="Version"><input name="version" value={formData.version} onChange={handleChange} placeholder="1.0.0" /></Field><Field label="License"><input name="license" value={formData.license} onChange={handleChange} placeholder="Single-site commercial" /></Field></div>
        <Field label="FAQ" hint="One question and answer per line: Question | Answer"><textarea name="faq" value={formData.faq} onChange={handleChange} rows="3" /></Field>
        <Field label="Demo URL" required><input type="url" name="demoUrl" value={formData.demoUrl} onChange={handleChange} placeholder="https://..." required /></Field>
        {saleProduct && <>
          <div className="admin-form-row"><Field label="Price (smallest currency unit)" hint="USD 29.00 = 2900" required><input type="number" min="1" step="1" name="priceAmount" value={formData.priceAmount} onChange={handleChange} required /></Field><Field label="Currency" required><input name="currency" maxLength="3" value={formData.currency} onChange={handleChange} required /></Field></div>
          <Field label="Pricing model"><select name="pricingType" value={formData.pricingType} onChange={handleChange}>{PRICING_TYPES.map((pricingType) => <option key={pricingType} value={pricingType}>{pricingType}</option>)}</select></Field>
          <div className="admin-link-grid"><Field label="Gumroad checkout URL" required><input type="url" name="checkoutUrl" value={formData.checkoutUrl} onChange={handleChange} placeholder="https://..." required /></Field><Field label="Gumroad product ID" hint="The immutable product ID from Gumroad API" required><input name="gumroadProductId" value={formData.gumroadProductId} onChange={handleChange} required /></Field><Field label="Gumroad permalink" hint="Optional, for reference"><input name="gumroadProductPermalink" value={formData.gumroadProductPermalink} onChange={handleChange} /></Field></div>
          <div className="admin-private-box"><h3>Private delivery</h3><p>This is never stored in the public product document. A verified customer receives a short-lived server-generated link.</p><Field label="Delivery type"><select name="deliveryType" value={formData.deliveryType} onChange={handleChange}><option value="download">Private file download</option><option value="access">Protected app access</option></select></Field>{formData.deliveryType === 'access' ? <Field label="Protected app access URL" hint="The destination app must enforce its own ARIX/Firebase entitlement" required><input type="url" name="accessUrl" value={formData.accessUrl} onChange={handleChange} placeholder="https://..." required /></Field> : <><Field label="Firebase Storage path" hint="Example: releases/arix-invoice-v1.zip" required><input name="downloadStoragePath" value={formData.downloadStoragePath} onChange={handleChange} required /></Field><Field label="Download filename"><input name="releaseName" value={formData.releaseName} onChange={handleChange} placeholder="arix-invoice-v1.zip" /></Field></>}</div>
        </>}
        <label className="admin-checkbox"><input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} /> Feature this product on the home page</label>
        <button type="submit" className="admin-submit-btn" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save product' : 'Add product'}</button>
      </form>
    </section>
    <section className="admin-list-card"><h2>All products ({products.length})</h2>{loadingProducts ? <p className="admin-empty">Loading…</p> : products.length === 0 ? <p className="admin-empty">No products yet. Start with a draft and publish when it is ready.</p> : <div className="admin-product-list">{products.map((product) => { const productReadiness = getProductReadiness(product, assets[product.id] || {}); return <article key={product.id} className="admin-product-item"><div className="admin-product-image">{product.coverImage ? <img src={product.coverImage} alt="" /> : <span>{product.name.slice(0, 2).toUpperCase()}</span>}</div><div className="admin-product-info"><h3>{product.name}</h3><p><span className={`admin-status ${product.status}`}>{product.status}</span> {product.productType === 'showcase' ? 'showcase · Built by ARIX' : `${product.category} · ${formatPrice(product.pricing) || 'No price'}`}</p>{product.status === 'published' && !productReadiness.ready && <small>Not public: {productReadiness.missing.join(', ')}</small>}</div><div className="admin-product-actions"><button type="button" onClick={() => handleEdit(product)}>Edit</button><button type="button" onClick={() => handleDelete(product)} className="admin-delete-btn">Delete</button></div></article> })}</div>}</section>
    </div>
  </div></main>
}

function Field({ label, hint, required, children }) {
  return <label className="admin-form-group"><span>{label}{required && <em> *</em>}</span>{hint && <small>{hint}</small>}{children}</label>
}

export default AdminDashboard
