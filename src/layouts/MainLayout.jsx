import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ParticleBackground from '../components/common/ParticleBackground'
import RatingPopup from '../components/common/RatingPopup'
import SupportChat from '../components/support/SupportChat'

function MainLayout() {
  return (
    <div className="main-layout">
      <ParticleBackground />
      <Navbar />
      <Outlet />
      <Footer />
      <RatingPopup />
      <SupportChat />
    </div>
  )
}

export default MainLayout