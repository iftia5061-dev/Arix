import { useState, useEffect } from 'react'
import { useAuth } from '../../context/authStore'
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import { getBotSettings, isAIEnabled, getMaxAICalls, getAICooldown, isAIOnlyForComplex } from '../../support/settings/botSettings'
import { agentStatus } from '../../support/live/agentStatus'
import './OwnerSettings.css'

function OwnerSettings() {
  const { user, isAdmin } = useAuth()
  const [isOwner, setIsOwner] = useState(false)
  const [settings, setSettings] = useState({
    aiEnabled: true,
    aiProvider: 'openai',
    aiModel: 'gpt-3.5-turbo',
    maxAICallsPerSession: 5,
    aiCooldownMs: 30000,
    emergencyDisable: false,
    aiOnlyForComplex: true,
    whatsappNumber: '8801910892757',
    showWhatsAppFallback: true,
    adminStatus: 'offline',
    autoReplyForWaiting: true,
    conversationTimeout: 30,
    welcomeMessage: '👋 Hello! Welcome to OROFEX Support. How can we help you today?',
    botName: 'OROFEX AI'
  })
  const [saveStatus, setSaveStatus] = useState('idle')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }

    // Check if user is owner (check specific owner document)
    const checkOwner = async () => {
      try {
        const ownerDoc = await getDoc(doc(db, 'admins', user.uid))
        const ownerData = ownerDoc.data()
        setIsOwner(ownerData?.role === 'admin')
      } catch (error) {
        console.error('Error checking owner status:', error)
        setIsOwner(false)
      }
    }

    checkOwner()

    // Load settings from Firestore
    const settingsRef = doc(db, 'supportSettings', 'main')
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setSettings({
          aiEnabled: data.aiEnabled ?? true,
          aiProvider: data.aiProvider ?? 'openai',
          aiModel: data.aiModel ?? 'gpt-3.5-turbo',
          maxAICallsPerSession: data.maxAICallsPerSession ?? 5,
          aiCooldownMs: data.aiCooldownMs ?? 30000,
          emergencyDisable: data.emergencyDisable ?? false,
          aiOnlyForComplex: data.aiOnlyForComplex ?? true,
          whatsappNumber: data.whatsappNumber ?? '8801910892757',
          showWhatsAppFallback: data.showWhatsAppFallback ?? true,
          adminStatus: agentStatus.getStatus(),
          autoReplyForWaiting: data.autoReplyForWaiting ?? true,
          conversationTimeout: data.conversationTimeout ?? 30,
          welcomeMessage: data.welcomeMessage ?? '👋 Hello! Welcome to OROFEX Support. How can we help you today?',
          botName: data.botName ?? 'OROFEX AI'
        })
      }
      setLoading(false)
    }, (error) => {
      console.error('Error loading settings:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, isAdmin])

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaveStatus('saving')

    try {
      const settingsRef = doc(db, 'supportSettings', 'main')
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date()
      })
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleAdminStatusChange = (newStatus) => {
    agentStatus.setStatus(newStatus)
    handleSettingChange('adminStatus', newStatus)
  }

  if (loading) {
    return (
      <div className="owner-settings-loading">
        <p>Loading settings...</p>
      </div>
    )
  }

  // Only owner can access (not just admin)
  if (!user || !isOwner) {
    return (
      <div className="owner-settings-access-denied">
        <h1>Access Denied</h1>
        <p>Only the owner can access these settings.</p>
        <a href="/admin" className="admin-nav-link">← Back to Admin</a>
      </div>
    )
  }

  return (
    <div className="owner-settings">
      <div className="owner-settings-header">
        <div>
          <h1>Owner Settings</h1>
          <div className="admin-nav">
            <a href="/admin" className="admin-nav-link">← Back to Admin</a>
            <a href="/admin/support" className="admin-nav-link">Support Dashboard</a>
          </div>
        </div>
      </div>

      <div className="settings-sections">
        {/* Bot Settings */}
        <div className="settings-section">
          <h2>🤖 Bot Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label>AI Enabled</label>
              <div className="setting-description">Enable/disable AI responses</div>
              <input
                type="checkbox"
                checked={settings.aiEnabled}
                onChange={(e) => handleSettingChange('aiEnabled', e.target.checked)}
              />
            </div>

            <div className="setting-item">
              <label>AI Provider</label>
              <div className="setting-description">AI service provider (OpenAI or Anthropic)</div>
              <select
                value={settings.aiProvider}
                onChange={(e) => handleSettingChange('aiProvider', e.target.value)}
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>

            <div className="setting-item">
              <label>AI Model</label>
              <div className="setting-description">AI model to use</div>
              <input
                type="text"
                value={settings.aiModel}
                onChange={(e) => handleSettingChange('aiModel', e.target.value)}
                placeholder="gpt-3.5-turbo"
              />
            </div>

            <div className="setting-item">
              <label>Max AI Calls per Session</label>
              <div className="setting-description">Maximum AI questions per user session</div>
              <input
                type="number"
                value={settings.maxAICallsPerSession}
                onChange={(e) => handleSettingChange('maxAICallsPerSession', parseInt(e.target.value))}
                min="1"
                max="20"
              />
            </div>

            <div className="setting-item">
              <label>AI Cooldown (seconds)</label>
              <div className="setting-description">Time between AI calls</div>
              <input
                type="number"
                value={settings.aiCooldownMs / 1000}
                onChange={(e) => handleSettingChange('aiCooldownMs', parseInt(e.target.value) * 1000)}
                min="10"
                max="120"
              />
            </div>

            <div className="setting-item">
              <label>AI Only for Complex Questions</label>
              <div className="setting-description">Use AI only for complex questions</div>
              <input
                type="checkbox"
                checked={settings.aiOnlyForComplex}
                onChange={(e) => handleSettingChange('aiOnlyForComplex', e.target.checked)}
              />
            </div>

            <div className="setting-item">
              <label>Emergency Disable</label>
              <div className="setting-description">Disable AI immediately (overrides other settings)</div>
              <input
                type="checkbox"
                checked={settings.emergencyDisable}
                onChange={(e) => handleSettingChange('emergencyDisable', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="settings-section">
          <h2>⚙️ General Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Bot Name</label>
              <div className="setting-description">Display name for the AI bot</div>
              <input
                type="text"
                value={settings.botName}
                onChange={(e) => handleSettingChange('botName', e.target.value)}
                placeholder="OROFEX AI"
              />
            </div>

            <div className="setting-item">
              <label>Welcome Message</label>
              <div className="setting-description">Initial greeting when chat opens</div>
              <textarea
                value={settings.welcomeMessage}
                onChange={(e) => handleSettingChange('welcomeMessage', e.target.value)}
                rows="2"
                placeholder="👋 Hello! Welcome to OROFEX Support."
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Settings */}
        <div className="settings-section">
          <h2>📱 WhatsApp Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label>WhatsApp Number</label>
              <div className="setting-description">Business WhatsApp number</div>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => handleSettingChange('whatsappNumber', e.target.value)}
                placeholder="8801910892757"
              />
            </div>

            <div className="setting-item">
              <label>Show WhatsApp Fallback</label>
              <div className="setting-description">Show WhatsApp when admin is offline</div>
              <input
                type="checkbox"
                checked={settings.showWhatsAppFallback}
                onChange={(e) => handleSettingChange('showWhatsAppFallback', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Admin Settings */}
        <div className="settings-section">
          <h2>👨‍💼 Admin Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Admin Status</label>
              <div className="setting-description">Current admin availability status</div>
              <select
                value={settings.adminStatus}
                onChange={(e) => handleAdminStatusChange(e.target.value)}
              >
                <option value="online">🟢 Online</option>
                <option value="away">🟡 Away</option>
                <option value="offline">🔴 Offline</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Auto-reply for Waiting</label>
              <div className="setting-description">Send auto-reply when waiting for admin</div>
              <input
                type="checkbox"
                checked={settings.autoReplyForWaiting}
                onChange={(e) => handleSettingChange('autoReplyForWaiting', e.target.checked)}
              />
            </div>

            <div className="setting-item">
              <label>Conversation Timeout (minutes)</label>
              <div className="setting-description">Auto-close inactive conversations</div>
              <input
                type="number"
                value={settings.conversationTimeout}
                onChange={(e) => handleSettingChange('conversationTimeout', parseInt(e.target.value))}
                min="5"
                max="120"
              />
            </div>
          </div>
        </div>

        {/* Usage Controls */}
        <div className="settings-section">
          <h2>📊 Usage Controls</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Max Questions per Minute</label>
              <div className="setting-description">Prevent spam with rate limiting</div>
              <input
                type="number"
                value={10}
                disabled
              />
              <div className="setting-note">Fixed at 10 for abuse protection</div>
            </div>

            <div className="setting-item">
              <label>Spam Threshold</label>
              <div className="setting-description">Same question repeats before blocking</div>
              <input
                type="number"
                value={3}
                disabled
              />
              <div className="setting-note">Fixed at 3 for abuse protection</div>
            </div>

            <div className="setting-item">
              <label>Off-topic Threshold</label>
              <div className="setting-description">Off-topic questions before blocking</div>
              <input
                type="number"
                value={2}
                disabled
              />
              <div className="setting-note">Fixed at 2 for abuse protection</div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button
          className="save-settings-button"
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? '✓ Saved!' : saveStatus === 'error' ? '✗ Error' : 'Save Settings'}
        </button>
        <button
          className="reset-settings-button"
          onClick={() => {
            setSettings({
              aiEnabled: true,
              aiProvider: 'openai',
              aiModel: 'gpt-3.5-turbo',
              maxAICallsPerSession: 5,
              aiCooldownMs: 30000,
              emergencyDisable: false,
              aiOnlyForComplex: true,
              whatsappNumber: '8801910892757',
              showWhatsAppFallback: true,
              adminStatus: 'offline',
              autoReplyForWaiting: true,
              conversationTimeout: 30,
              welcomeMessage: '👋 Hello! Welcome to OROFEX Support. How can we help you today?',
              botName: 'OROFEX AI'
            })
          }}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}

export default OwnerSettings
