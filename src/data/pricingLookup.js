import { aiBotPackages } from './aiBotPackages'
import { softwareCategories } from './softwarePackages'
import { toolsCategories } from './toolsPackages'
import { webDesignPackages } from './webDesignPackages'

function toIdentifier(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function priceAmount(price) {
  return Number(String(price).replace(/[^0-9]/g, ''))
}

export function getOrderPlanId({ category, tier, subService }) {
  return [category, subService, tier].filter(Boolean).map(toIdentifier).join('--')
}

function createPricingOption({ category, categoryLabel, tier, tierLabel, subService = null, subServiceLabel = null, priceBDT, priceUSD, delivery = null, period = null }) {
  const planId = getOrderPlanId({ category, tier, subService })

  return {
    planId,
    category,
    categoryLabel,
    tier: toIdentifier(tier),
    tierLabel,
    subService,
    subServiceLabel,
    priceBDT,
    priceUSD,
    delivery,
    period,
    priceAmount: priceAmount(priceBDT),
    priceCurrency: 'BDT',
    priceDisplay: priceBDT,
    billingPeriod: period ? 'monthly' : 'one-time',
    isStartingAt: priceBDT.includes('+'),
  }
}

export const allPricingOptions = [
  ...webDesignPackages.map((pkg) => createPricingOption({
    category: 'web-design',
    categoryLabel: 'Web Design',
    tier: pkg.name,
    tierLabel: pkg.name,
    priceBDT: pkg.priceBDT,
    priceUSD: pkg.priceUSD,
    delivery: pkg.delivery,
  })),
  ...aiBotPackages.map((pkg) => createPricingOption({
    category: 'ai-bot',
    categoryLabel: 'AI Bot',
    tier: pkg.name,
    tierLabel: pkg.name,
    priceBDT: pkg.priceBDT,
    priceUSD: pkg.priceUSD,
    delivery: pkg.delivery,
  })),
  ...softwareCategories.flatMap((subService) => subService.packages.map((pkg) => createPricingOption({
    category: 'software',
    categoryLabel: 'Software',
    tier: pkg.name,
    tierLabel: pkg.name,
    subService: subService.id,
    subServiceLabel: subService.label,
    priceBDT: pkg.priceBDT,
    priceUSD: pkg.priceUSD,
    delivery: pkg.delivery,
  }))),
  ...toolsCategories.flatMap((subService) => subService.packages.map((pkg) => createPricingOption({
    category: 'tools',
    categoryLabel: 'Tools',
    tier: pkg.name,
    tierLabel: pkg.name,
    subService: subService.id,
    subServiceLabel: subService.label,
    priceBDT: pkg.priceBDT,
    priceUSD: pkg.priceUSD,
    period: pkg.period,
  }))),
]

export const orderPlanSeeds = allPricingOptions.map((option) => ({
  id: option.planId,
  category: option.category,
  categoryLabel: option.categoryLabel,
  name: option.tierLabel,
  subService: option.subService,
  subServiceLabel: option.subServiceLabel,
  priceAmount: option.priceAmount,
  priceCurrency: option.priceCurrency,
  priceDisplay: option.priceDisplay,
  billingPeriod: option.billingPeriod,
  isStartingAt: option.isStartingAt,
  delivery: option.delivery,
  active: true,
}))

export function findPricingOption({ category, tier, subService }) {
  return allPricingOptions.find((option) => (
    option.category === toIdentifier(category)
    && option.tier === toIdentifier(tier)
    && (subService ? option.subService === toIdentifier(subService) : true)
  ))
}

export function buildOrderLink(plan) {
  const planId = typeof plan === 'string' ? plan : plan?.planId
  return planId ? `/contact?plan=${encodeURIComponent(planId)}` : '/contact'
}

export function formatOrderPlanPrice(plan) {
  if (!plan?.priceDisplay) return 'Custom quote'
  return `${plan.priceDisplay}${plan.billingPeriod === 'monthly' ? ' / month' : ''}`
}
