const WHATSAPP_NUMBER = '8801825453585'

export function getWhatsAppOrderLink(productName, price) {
  const message = `Hi Orofex! I'm interested in buying: ${productName} (${price}). Can you tell me more?`
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
}