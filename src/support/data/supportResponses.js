export const SUPPORT_RESPONSES = {
  // ===== COMPANY INFORMATION =====
  about: {
    title: 'About OROFEX',
    message: 'OROFEX is a premium digital products and AI solutions company. We specialize in web design, software development, SaaS platforms, AI tools, and custom solutions for businesses.',
    action: 'https://www.orofex.xyz/about',
    category: 'company'
  },
  contact: {
    title: 'Contact Us',
    message: 'You can contact us through our contact form, email us at contact@orofex.com, or reach us on WhatsApp. We\'ll get back to you as soon as possible.',
    action: 'https://www.orofex.xyz/contact',
    category: 'company'
  },

  // ===== SERVICES =====
  services: {
    title: 'Our Services',
    message: 'We offer a wide range of digital services including Web Design, Software Development, SaaS Solutions, AI Tools, Mobile Apps, and Custom Tools. What type of service are you interested in?',
    options: 'services',
    category: 'services'
  },
  'web-design': {
    title: 'Web Design Services',
    message: 'We create modern, responsive websites with premium design. Our web design services include custom layouts, dark themes, animations, and SEO optimization. Starting from $299.',
    action: 'https://www.orofex.xyz/web-design',
    category: 'services'
  },
  software: {
    title: 'Software Development',
    message: 'We develop custom software solutions for businesses. Our software is built with modern technologies, ensuring performance and scalability. Contact us for a quote.',
    action: 'https://www.orofex.xyz/software',
    category: 'services'
  },
  saas: {
    title: 'SaaS Solutions',
    message: 'We build scalable SaaS platforms with features like user authentication, payment integration, and cloud storage. Perfect for subscription-based businesses.',
    action: 'https://www.orofex.xyz/products',
    category: 'services'
  },
  ai: {
    title: 'AI Tools & Solutions',
    message: 'We develop AI-powered tools including chatbots, automation systems, and machine learning solutions. Transform your business with cutting-edge AI technology.',
    action: 'https://www.orofex.xyz/ai',
    category: 'services'
  },
  mobile: {
    title: 'Mobile App Development',
    message: 'We create mobile applications for iOS and Android. Our apps are user-friendly, performant, and follow modern design guidelines.',
    action: 'https://www.orofex.xyz/products',
    category: 'services'
  },
  tools: {
    title: 'Custom Tools',
    message: 'We build custom tools and utilities to streamline your business processes. From simple utilities to complex applications, we\'ve got you covered.',
    action: 'https://www.orofex.xyz/tools',
    category: 'services'
  },
  custom: {
    title: 'Custom Projects',
    message: 'We do custom software, SaaS, AI, and web development projects. For a custom quote, please contact us through our contact form with your requirements.',
    action: 'https://www.orofex.xyz/contact',
    category: 'services'
  },

  // ===== PRODUCTS =====
  products: {
    title: 'Our Products',
    message: 'We have various products including SaaS platforms, AI tools, software applications, web designs, desktop apps, and mobile apps. Browse our products to find what you need.',
    options: 'products',
    category: 'products'
  },
  demo: {
    title: 'Product Demos',
    message: 'Many of our products have live demos available. You can view demos on our product pages or contact us for personalized demonstrations.',
    action: 'https://www.orofex.xyz/products',
    category: 'products'
  },

  // ===== PRICING =====
  pricing: {
    title: 'Pricing Information',
    message: 'Our pricing varies by product and service type. We offer competitive rates for all our digital solutions. Would you like to know about specific pricing?',
    options: 'pricing',
    category: 'pricing'
  },
  'pricing-overview': {
    title: 'Pricing Overview',
    message: 'Our products start from $29 for basic tools and go up to $999+ for enterprise solutions. Custom projects are quoted based on requirements. Contact us for a detailed quote.',
    action: 'https://www.orofex.xyz/pricing',
    category: 'pricing'
  },
  'payment-methods': {
    title: 'Payment Methods',
    message: 'We accept payments via credit/debit cards, PayPal, and other secure payment gateways. All transactions are encrypted and secure.',
    category: 'pricing'
  },
  discounts: {
    title: 'Discounts & Offers',
    message: 'We occasionally offer discounts and special promotions. Subscribe to our newsletter or follow us on social media to stay updated on our latest offers.',
    category: 'pricing'
  },

  // ===== PURCHASE =====
  buy: {
    title: 'How to Buy',
    message: 'You can purchase our products directly from our website using secure payment methods. Simply visit the product page and click the purchase button.',
    action: 'https://www.orofex.xyz/products',
    category: 'purchase'
  },
  'payment-help': {
    title: 'Payment Help',
    message: 'We accept payments via credit/debit cards, PayPal, and other secure payment gateways. If you\'re having payment issues, please check your payment details or contact support.',
    action: 'https://www.orofex.xyz/contact',
    category: 'purchase'
  },

  // ===== DOWNLOADS =====
  download: {
    title: 'Download Help',
    message: 'After purchase, you can download your products from your dashboard or the confirmation email. If you face any issues, please contact support.',
    action: 'https://www.orofex.xyz/dashboard',
    category: 'downloads'
  },

  // ===== ORDER SUPPORT =====
  'order-support': {
    title: 'Order Support',
    message: 'For order-related issues including payment problems, download issues, or wrong products, please contact our support team. We\'ll help you resolve it quickly.',
    options: 'order',
    category: 'order-support'
  },
  'payment-issue': {
    title: 'Payment Issues',
    message: 'If you\'re having payment issues, please check your payment details and try again. If the problem persists, contact our support team with your order details.',
    type: 'human-handoff',
    category: 'order-support'
  },
  'download-issue': {
    title: 'Download Issues',
    message: 'If you can\'t download your purchase, please check your email for the download link or visit your dashboard. For further assistance, contact support.',
    action: 'https://www.orofex.xyz/dashboard',
    category: 'order-support'
  },
  'not-received': {
    title: 'Product Not Received',
    message: 'If you haven\'t received your product after purchase, please wait a few minutes for the payment to process. If it\'s been more than 30 minutes, contact support immediately.',
    type: 'human-handoff',
    category: 'order-support'
  },
  'wrong-product': {
    title: 'Wrong Product',
    message: 'If you received the wrong product, please contact our support team with your order details and we\'ll resolve it quickly.',
    type: 'human-handoff',
    category: 'order-support'
  },
  other: {
    title: 'Other Order Issues',
    message: 'For other order-related issues, please describe your problem in detail and our support team will help you resolve it.',
    type: 'human-handoff',
    category: 'order-support'
  },

  // ===== TECHNICAL SUPPORT =====
  technical: {
    title: 'Technical Support',
    message: 'For technical issues, please provide details about your problem and we\'ll help you resolve it quickly. You can also email us at contact@orofex.com',
    action: 'https://www.orofex.xyz/contact',
    category: 'technical-support'
  },

  // ===== FAQ =====
  faq: {
    title: 'FAQ',
    message: 'Here are some frequently asked questions. For more detailed information, please visit our FAQ page.',
    action: 'https://www.orofex.xyz/faq',
    category: 'faq'
  },

  // ===== LIVE CHAT =====
  admin: {
    title: 'Talk to Admin',
    message: 'Our support team is available to help you with any questions or issues. Please wait while we connect you with a support agent.',
    type: 'human-handoff',
    category: 'live-chat'
  },
  whatsapp: {
    title: 'WhatsApp Support',
    message: 'You can also reach us on WhatsApp for quick support. Click below to start a WhatsApp conversation.',
    action: 'https://wa.me/8801910892757',
    type: 'whatsapp',
    category: 'live-chat'
  },

  // ===== AI =====
  ai: {
    title: 'Ask AI',
    message: 'I\'m the OROFEX AI assistant. I can help you with questions about our products, services, pricing, and support. Ask me anything related to OROFEX!',
    type: 'ai-prompt',
    category: 'ai'
  },

  // ===== HANDOFF STATES =====
  'waiting-admin': {
    title: 'Connecting to Support',
    message: 'Requesting human support... Please wait while we connect you with a support agent.',
    type: 'waiting-admin',
    category: 'handoff'
  },
  'admin-joined': {
    title: 'Support Agent Online',
    message: 'A support agent has joined the conversation. You can now chat directly with our team.',
    type: 'human',
    category: 'handoff'
  },
  'admin-left': {
    title: 'Bot Mode',
    message: 'The support agent has left. Returning to bot mode. How can I help you?',
    type: 'bot',
    category: 'handoff'
  },
  'admin-offline': {
    title: 'Support Unavailable',
    message: 'Our support team is currently offline. Please try again later or contact us on WhatsApp for immediate assistance.',
    type: 'admin-offline',
    action: 'https://wa.me/8801910892757',
    category: 'handoff'
  },

  // ===== PRODUCT-SPECIFIC =====
  'product-features': {
    title: 'Product Features',
    message: 'This product includes premium features designed for optimal performance. For detailed feature information, please visit the product page or ask a specific question.',
    action: null,
    category: 'product-specific'
  },
  'product-pricing': {
    title: 'Product Pricing',
    message: 'Pricing information is available on the product page. Please check the product details for current pricing and purchase options.',
    action: null,
    category: 'product-specific'
  },
  'product-demo': {
    title: 'Product Demo',
    message: 'A demo is available for this product. You can view it on the product page or request a personalized demonstration.',
    action: null,
    category: 'product-specific'
  },
  'product-buy': {
    title: 'Buy Now',
    message: 'You can purchase this product directly from the product page using secure payment methods. Click the purchase button to proceed.',
    action: null,
    category: 'product-specific'
  },
  'product-support': {
    title: 'Product Support',
    message: 'For product-specific support, you can contact our team or ask a detailed question about any issues you\'re experiencing.',
    action: null,
    category: 'product-specific'
  },

  // ===== GENERAL =====
  greeting: {
    title: 'Welcome',
    message: '👋 Hello! Welcome to OROFEX Support. How can we help you today?',
    category: 'general'
  },
  goodbye: {
    title: 'Goodbye',
    message: 'Thank you for contacting OROFEX Support. If you need further assistance, feel free to reach out anytime. Have a great day! 👋',
    category: 'general'
  },
  unknown: {
    title: 'I\'m not sure',
    message: 'I\'m not sure I understand. Could you please rephrase your question or choose from the available options?',
    category: 'general'
  },
  off_topic: {
    title: 'Off-topic',
    message: 'I can help with OROFEX products, services, purchases, and support. Please ask me something related to OROFEX.',
    category: 'general'
  },
}
