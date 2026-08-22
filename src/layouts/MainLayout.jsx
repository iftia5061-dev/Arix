import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ParticleBackground from '../components/common/ParticleBackground'

function MainLayout() {
  return (
    <div className="main-layout">
      <ParticleBackground />
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}

export default MainLayout