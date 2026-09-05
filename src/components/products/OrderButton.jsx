import { Link } from 'react-router-dom'
import './ProductActions.css'

function OrderButton({ to = '/contact', planId = null, className = '', children = 'Order Now' }) {
  const linkTo = planId ? `${to}?plan=${encodeURIComponent(planId)}` : to

  return (
    <Link to={linkTo} className={`product-commerce-action product-commerce-action--order ${className}`.trim()} aria-label="Order Now - Request custom service">
      {children}
    </Link>
  )
}

export default OrderButton