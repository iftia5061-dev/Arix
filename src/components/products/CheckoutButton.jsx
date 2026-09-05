import './ProductActions.css'

function CheckoutButton({ checkoutUrl, className = '', children = 'Buy Now' }) {
  if (!checkoutUrl) return null

  return (
    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className={`product-commerce-action product-commerce-action--buy ${className}`.trim()} aria-label="Buy Now - Purchase via Gumroad">
      {children}
    </a>
  )
}

export default CheckoutButton
