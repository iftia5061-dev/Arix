import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'

const Home = lazy(() => import('../pages/Home'))
const Products = lazy(() => import('../pages/Products'))
const ProductDetails = lazy(() => import('../pages/ProductDetails'))
const Services = lazy(() => import('../pages/Services'))
const About = lazy(() => import('../pages/About'))
const Contact = lazy(() => import('../pages/Contact'))
const Pricing = lazy(() => import('../pages/Pricing'))
const Portfolio = lazy(() => import('../pages/Portfolio'))
const AI = lazy(() => import('../pages/AI'))
const Blog = lazy(() => import('../pages/Blog'))
const BlogDetails = lazy(() => import('../pages/BlogDetails'))
const FAQ = lazy(() => import('../pages/FAQ'))
const Privacy = lazy(() => import('../pages/Privacy'))
const Terms = lazy(() => import('../pages/Terms'))
const NotFound = lazy(() => import('../pages/NotFound'))
const WebDesign = lazy(() => import('../pages/WebDesign'))
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'))
const UserDashboard = lazy(() => import('../pages/UserDashboard'))
const AIBot = lazy(() => import('../pages/AIBot'))
const Software = lazy(() => import('../pages/Software'))
const Tools = lazy(() => import('../pages/Tools'))

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="route-loading">Loading…</div>}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/web-design" element={<WebDesign />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/ai-bot" element={<AIBot />} />
            <Route path="/software" element={<Software />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetails />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/ai" element={<AI />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetails />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRoutes
