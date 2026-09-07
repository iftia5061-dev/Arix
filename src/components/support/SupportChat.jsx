import { useState, useEffect } from 'react'
import { initBotSettings, cleanupBotSettings } from '../../support/settings/botSettings'
import { useAuth } from '../../context/authStore'
import SupportLauncher from './SupportLauncher'
import SupportWindow from './SupportWindow'

function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    // Initialize bot settings when component mounts
    initBotSettings()

    return () => {
      cleanupBotSettings()
    }
  }, [])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      <SupportLauncher isOpen={isOpen} onToggle={handleToggle} />
      <SupportWindow isOpen={isOpen} onClose={handleClose} />
    </>
  )
}

export default SupportChat
