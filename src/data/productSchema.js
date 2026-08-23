const string = (value) => (typeof value === 'string' ? value.trim() : '')

const lines = (value) => {
  if (Array.isArray(value)) return value.map(string).filter(Boolean)
  return string(value).split(/\r?\n|,/).map(string).filter(Boolean)
}

const validUrl = (value) => {
  try {
    const parsed = new URL(string(value))
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export const isGumroadCheckoutUrl = (value) => {
  if (!validUrl(value)) return false
  const hostname = new URL(string(value)).hostname.toLowerCase()
  return hostname === 'gumroad.com' || hostname.endsWith('.gumroad.com')
}

const priceToCents = (value) => {
  const raw = Number(value)
  if (!Number.isFinite(raw) || raw <= 0 || raw > 1000000) return null
  const cents = Math.round(raw * 100)
  return Math.abs(raw - cents / 100) < 0.000001 ? cents : null
}

const validStoredAmount = (value) => Number.isInteger(value) && value > 0 && value <= 100000000

export const PRODUCT_CATEGORIES = [
  { value: 'software', label: 'Software' },
  { value: 'saas', label: 'SaaS' },
  { value: 'ai', label: 'AI' },
  { value: 'mobile-apps', label: 'Mobile apps' },
  { value: 'tools', label: 'Tools' },
  { value: 'web-design', label: 'Web design' },
]

export const PRODUCT_STATUSES = ['draft', 'published', 'archived']
export const PRODUCT_TYPES = ['sale', 'showcase']
export const PRICING_TYPES = ['one-time', 'subscription', 'lifetime']

export const emptyProductForm = {
  name: '', slug: '', status: 'draft', productType: 'sale', category: 'software',
  platforms: '', shortDescription: '', description: '', coverImage: '', images: '',
  features: '', requirements: '', included: '', faq: '', version: '', license: '',
  price: '', currency: 'USD', pricingType: 'one-time', demoUrl: '', checkoutUrl: '', featured: false,
}

export function slugify(value) {
  return string(value).toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function normalizeProduct(value = {}, id = '') {
  const productType = value.productType === 'showcase' ? 'showcase' : 'sale'
  const rawImages = lines(value.images)
  const coverImage = string(value.coverImage)
  const images = [...new Set([coverImage, ...rawImages].filter(validUrl))]
  const rawPricing = value.pricing && typeof value.pricing === 'object' ? value.pricing : {}
  const rawLinks = value.links && typeof value.links === 'object' ? value.links : {}
  const amount = Number(rawPricing.amount)
  const currency = string(rawPricing.currency).toUpperCase()
  const pricing = productType === 'sale' && validStoredAmount(amount) && /^[A-Z]{3}$/.test(currency)
    ? { amount, currency, type: PRICING_TYPES.includes(rawPricing.type) ? rawPricing.type : 'one-time' }
    : null

  return {
    id,
    name: string(value.name),
    slug: slugify(value.slug),
    status: PRODUCT_STATUSES.includes(value.status) ? value.status : 'draft',
    visibility: value.visibility === 'public' ? 'public' : 'private',
    productType,
    category: string(value.category) || 'software',
    platforms: lines(value.platforms),
    shortDescription: string(value.shortDescription),
    description: string(value.description),
    coverImage: images[0] || '',
    images,
    features: lines(value.features),
    requirements: lines(value.requirements),
    included: lines(value.included),
    version: string(value.version),
    license: string(value.license),
    faq: Array.isArray(value.faq)
      ? value.faq.map((item) => ({ question: string(item?.question), answer: string(item?.answer) })).filter((item) => item.question && item.answer)
      : [],
    pricing,
    links: {
      demoUrl: validUrl(rawLinks.demoUrl) ? string(rawLinks.demoUrl) : '',
      checkoutUrl: productType === 'sale' && isGumroadCheckoutUrl(rawLinks.checkoutUrl) ? string(rawLinks.checkoutUrl) : '',
    },
    featured: Boolean(value.featured),
  }
}

export const isSaleProduct = (product) => product?.productType === 'sale'

export function formatPrice(pricing) {
  if (!pricing || !validStoredAmount(pricing.amount) || !pricing.currency) return ''
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: pricing.currency }).format(pricing.amount / 100)
  } catch {
    return `${pricing.currency} ${(pricing.amount / 100).toFixed(2)}`
  }
}

export function pricingLabel(pricing) {
  if (!pricing) return ''
  const type = pricing.type === 'one-time' ? 'One-time purchase' : pricing.type === 'lifetime' ? 'Lifetime access' : pricing.type === 'subscription' ? 'Subscription' : ''
  return [formatPrice(pricing), type].filter(Boolean).join(' · ')
}

function hasText(value) { return Boolean(string(value)) }

// Only live, browsable website products need a demo link. Apps, software and
// tools can be presented through their screenshots instead.
export const CATEGORIES_REQUIRING_DEMO = ['web-design', 'saas']
export const requiresDemoUrl = (category) => CATEGORIES_REQUIRING_DEMO.includes(category)

export function getProductReadiness(product) {
  const missing = []
  if (!hasText(product.name)) missing.push('product name')
  if (!hasText(product.slug)) missing.push('URL slug')
  if (!validUrl(product.coverImage)) missing.push('cover image')
  if (!hasText(product.shortDescription)) missing.push('short description')
  if (!hasText(product.description)) missing.push('product overview')
  if (!product.platforms?.length) missing.push('platform')
  if (!product.features?.length) missing.push('features')
  if (requiresDemoUrl(product.category) && !validUrl(product.links?.demoUrl)) missing.push('demo URL')

  if (isSaleProduct(product)) {
    if (!product.pricing || !validStoredAmount(product.pricing.amount) || !/^[A-Z]{3}$/.test(product.pricing.currency) || !PRICING_TYPES.includes(product.pricing.type)) missing.push('price')
    if (!isGumroadCheckoutUrl(product.links?.checkoutUrl)) missing.push('Gumroad checkout URL')
  }
  return { ready: missing.length === 0, missing }
}

export function isPublicProduct(product) {
  return product.status === 'published' && product.visibility === 'public' && getProductReadiness(product).ready
}

export function formToProduct(form) {
  const productType = form.productType === 'showcase' ? 'showcase' : 'sale'
  const images = [...new Set([string(form.coverImage), ...lines(form.images)].filter(validUrl))]
  const product = {
    name: string(form.name),
    slug: slugify(form.slug),
    status: PRODUCT_STATUSES.includes(form.status) ? form.status : 'draft',
    visibility: form.status === 'published' ? 'public' : 'private',
    productType,
    category: string(form.category) || 'software',
    platforms: lines(form.platforms),
    shortDescription: string(form.shortDescription),
    description: string(form.description),
    coverImage: images[0] || '',
    images,
    features: lines(form.features),
    requirements: lines(form.requirements),
    included: lines(form.included),
    version: string(form.version),
    license: string(form.license),
    faq: string(form.faq).split(/\r?\n/).map((row) => {
      const [question, ...answer] = row.split('|')
      return { question: string(question), answer: string(answer.join('|')) }
    }).filter((item) => item.question && item.answer),
    links: { demoUrl: string(form.demoUrl) },
    featured: Boolean(form.featured),
  }

  if (productType === 'sale') {
    product.pricing = {
      amount: priceToCents(form.price),
      currency: string(form.currency).toUpperCase(),
      type: PRICING_TYPES.includes(form.pricingType) ? form.pricingType : 'one-time',
    }
    product.links.checkoutUrl = string(form.checkoutUrl)
  }
  return product
}

export function productToForm(product) {
  const isSale = isSaleProduct(product)
  return {
    ...emptyProductForm,
    name: product.name, slug: product.slug, status: product.status, productType: product.productType, category: product.category,
    platforms: product.platforms.join(', '), shortDescription: product.shortDescription, description: product.description,
    coverImage: product.coverImage, images: product.images.filter((image) => image !== product.coverImage).join('\n'), features: product.features.join('\n'),
    requirements: product.requirements.join('\n'), included: product.included.join('\n'), faq: product.faq.map((item) => `${item.question} | ${item.answer}`).join('\n'),
    version: product.version, license: product.license, demoUrl: product.links.demoUrl, featured: product.featured,
    ...(isSale ? {
      price: product.pricing?.amount ? String(product.pricing.amount / 100) : '', currency: product.pricing?.currency || 'USD', pricingType: product.pricing?.type || 'one-time',
      checkoutUrl: product.links.checkoutUrl,
    } : {}),
  }
}
