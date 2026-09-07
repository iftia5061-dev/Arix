// OROFEX-related keywords for scope detection
const OROFEX_KEYWORDS = [
  'orofex',
  'arix',
  'product',
  'service',
  'pricing',
  'price',
  'cost',
  'payment',
  'pay',
  'buy',
  'purchase',
  'download',
  'demo',
  'support',
  'help',
  'software',
  'saas',
  'ai',
  'artificial intelligence',
  'web design',
  'website',
  'mobile app',
  'android',
  'ios',
  'tool',
  'custom',
  'project',
  'development',
  'design',
  'feature',
  'license',
  'subscription',
  'enterprise',
  'business',
  // Real Bangla (Unicode) keywords
  'দাম',
  'কত',
  'কতো',
  'টাকা',
  'কিনব',
  'কিনবো',
  'কেনা',
  'দরকার',
  'পেমেন্ট',
  'সাপোর্ট',
  'সহায়তা',
  'সমস্যা',
  'পণ্য',
  'প্রোডাক্ট',
  'সার্ভিস',
  'সেবা',
  'ডাউনলোড',
  'যোগাযোগ',
  'প্রশ্ন',
  'কিভাবে',
  'কীভাবে',
  'ওয়েবসাইট',
  'সফটওয়্যার',
  'কাস্টম',
  'অর্ডার',
  // Bangla/Banglish keywords
  'dam',
  'koto',
  'taka',
  'kinbo',
  'kine',
  'dorkar',
  'bivaron',
  'shaport',
  'sharba',
  'design',
  'software',
  'download',
  'payment',
  'peyment',
  'support',
  'product',
  'service',
  'web',
  'app',
  'ai',
  'tool',
  'feature',
  'fitur',
  'dijain',
  'saftwar',
  'saas',
  'mobile',
  'kivabe',
  'how',
  'get',
  'pabe',
  'kache',
  'kontact',
  'contact',
  'jogajog',
  'question',
  'shongkkha',
  'faq',
  'pricing',
  'order',
  'technical',
  'issue',
  'problem',
  'error',
  'bug',
]

// Clearly off-topic topics to block
const OFF_TOPIC_KEYWORDS = [
  'president',
  'politics',
  'election',
  'government',
  'weather',
  'sports',
  'football',
  'cricket',
  'celebrity',
  'movie',
  'music',
  'entertainment',
  'news',
  'gossip',
  'religion',
  'joke',
  'funny',
  'recipe',
  'cooking',
  'food',
  'personal advice',
  'medical advice',
  'legal advice',
  'investment advice',
  'stock market',
  'crypto',
  'cryptocurrency',
  'bitcoin',
  'blockchain',
  'dating',
  'relationship',
  'horoscope',
  'astrology',
  'gambling',
  'casino',
  'betting',
  // Real Bangla off-topic keywords
  'রাজনীতি',
  'নির্বাচন',
  'সরকার',
  'আবহাওয়া',
  'খেলা',
  'ফুটবল',
  'ক্রিকেট',
  'সিনেমা',
  'গান',
  'রসিকতা',
  'রেসিপি',
  'রান্না',
  'জ্যোতিষ',
  'রাশিফল',
]

export function isOROFEXRelated(text) {
  const lowerText = text.toLowerCase().trim()

  // First check for clearly off-topic content
  const isOffTopic = OFF_TOPIC_KEYWORDS.some(keyword => lowerText.includes(keyword))
  if (isOffTopic) {
    return false
  }

  // Check for OROFEX-related keywords
  const hasOROFEXKeyword = OROFEX_KEYWORDS.some(keyword => lowerText.includes(keyword))
  if (hasOROFEXKeyword) {
    return true
  }

  // If question is about technical/commercial topics, it might be relevant
  const technicalKeywords = ['develop', 'build', 'create', 'make', 'design', 'code', 'programming', 'app', 'website', 'software', 'platform', 'system', 'digital', 'online', 'internet']
  const hasTechnicalKeyword = technicalKeywords.some(keyword => lowerText.includes(keyword))
  
  if (hasTechnicalKeyword) {
    return true
  }

  // Default to false if no relevant keywords found
  return false
}

export function getOffTopicResponse() {
  return {
    title: 'Off-topic',
    message: 'I can help with OROFEX products, services, purchases, and support. Please ask me something related to OROFEX.',
    type: 'off-topic'
  }
}