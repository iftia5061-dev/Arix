import Hero from '../components/home/Hero'
import ProductMarquee from '../components/home/ProductMarquee'
import Categories from '../components/home/Categories'
import FeaturedProducts from '../components/home/FeaturedProducts'
import ServicesPreview from '../components/home/ServicesPreview'
import AISolutions from '../components/home/AISolutions'
import CTA from '../components/home/CTA'

function Home() {
  return (
    <div>
      <Hero />
      <ProductMarquee />
      <Categories />
      <FeaturedProducts />
      <ServicesPreview />
      <AISolutions />
      <CTA />
    </div>
  )
}

export default Home
