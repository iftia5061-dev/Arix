function CheckoutButton({ checkoutUrl, className = '', children = 'Buy Now' }) {
  if (!checkoutUrl) return null

  return (
    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

export default CheckoutButton
