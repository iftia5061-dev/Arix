import { getCategoryProductsMenu } from './productData'

export const MAIN_MENU_OPTIONS = [
  { id: 'services', label: '🧩 Our Services', icon: '🧩' },
  { id: 'products', label: '🛍 Products', icon: '🛍' },
  { id: 'pricing', label: '💰 Pricing', icon: '💰' },
  { id: 'demo', label: '👁 Product Demo', icon: '👁' },
  { id: 'buy', label: '💳 How to Buy', icon: '💳' },
  { id: 'payment-help', label: '💵 Payment Help', icon: '💵' },
  { id: 'download', label: '📦 Download Help', icon: '📦' },
  { id: 'order-support', label: '📋 Order Support', icon: '📋' },
  { id: 'technical', label: '🛠 Technical Support', icon: '🛠' },
  { id: 'custom', label: '🎨 Custom Project', icon: '🎨' },
  { id: 'faq', label: '❓ FAQ', icon: '❓' },
  { id: 'about', label: 'ℹ️ About OROFEX', icon: 'ℹ️' },
  { id: 'contact', label: '📞 Contact Us', icon: '📞' },
  { id: 'admin', label: '👨‍💼 Talk to Admin', icon: '👨‍💼' },
  { id: 'whatsapp', label: '📱 WhatsApp', icon: '📱' },
  { id: 'ai', label: '🤖 Ask AI', icon: '🤖' },
]

export const SERVICES_MENU = [
  { id: 'web-design', label: 'Web Design', parent: 'services' },
  { id: 'software', label: 'Software', parent: 'services' },
  { id: 'saas', label: 'SaaS', parent: 'services' },
  { id: 'ai', label: 'AI Tools', parent: 'services' },
  { id: 'mobile', label: 'Mobile Apps', parent: 'services' },
  { id: 'tools', label: 'Tools', parent: 'services' },
  { id: 'back', label: '← Back', parent: 'services' },
  { id: 'main', label: '🏠 Main Menu', parent: 'services' },
]

export const PRODUCTS_MENU = [
  getCategoryProductsMenu('software'),
  getCategoryProductsMenu('saas'),
  getCategoryProductsMenu('ai'),
  getCategoryProductsMenu('mobile-apps'),
  getCategoryProductsMenu('tools'),
  getCategoryProductsMenu('web-design'),
  { id: 'back', label: '← Back', parent: 'products' },
  { id: 'main', label: '🏠 Main Menu', parent: 'products' },
]

export const PRICING_MENU = [
  { id: 'pricing-overview', label: 'Pricing Overview', parent: 'pricing' },
  { id: 'payment-methods', label: 'Payment Methods', parent: 'pricing' },
  { id: 'discounts', label: 'Discounts & Offers', parent: 'pricing' },
  { id: 'back', label: '← Back', parent: 'pricing' },
  { id: 'main', label: '🏠 Main Menu', parent: 'pricing' },
]

export const ORDER_SUPPORT_MENU = [
  { id: 'payment-issue', label: 'Payment Issue', parent: 'order' },
  { id: 'download-issue', label: 'Download Issue', parent: 'order' },
  { id: 'not-received', label: 'Product Not Received', parent: 'order' },
  { id: 'wrong-product', label: 'Wrong Product', parent: 'order' },
  { id: 'other', label: 'Other Issue', parent: 'order' },
  { id: 'back', label: '← Back', parent: 'order' },
  { id: 'main', label: '🏠 Main Menu', parent: 'order' },
]
