import Hero from '../components/home/Hero'
import ProductMarquee from '../components/home/ProductMarquee'
import Categories from '../components/home/Categories'
import FeaturedProducts from '../components/home/FeaturedProducts'
import ServicesPreview from '../components/home/ServicesPreview'
import WhyOrofex from '../components/home/WhyOrofex'
import AISolutions from '../components/home/AISolutions'
import Stats from '../components/home/Stats'
import PortfolioPreview from '../components/home/PortfolioPreview'
import Testimonials from '../components/home/Testimonials'
import CTA from '../components/home/CTA'

function Home() {
  return (
    <div>
      <Hero />
      <ProductMarquee />
      <Categories />
      <FeaturedProducts />
      <ServicesPreview />
      <WhyOrofex />
      <AISolutions />
      <Stats />
      <PortfolioPreview />
      <Testimonials />
      <CTA />
    </div>
  )
}

export default Home