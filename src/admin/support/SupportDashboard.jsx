import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/authStore'
import { auth } from '../../firebase'
import { agentStatus } from '../../support/live/agentStatus'
import { handoffManager } from '../../support/live/handoff'
import { conversationManager } from '../../support/live/conversationManager'
import './SupportDashboard.css'

function SupportDashboard() {
  const { user, isAdmin } = useAuth()
  const [status, setStatus] = useState('offline')
  const [conversations, setConversations] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [adminMessage, setAdminMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const allConversationsUnsubscribeRef = useRef(null)
  const selectedConversationUnsubscribeRef = useRef(null)

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }

    // Load initial status from Firestore
    agentStatus.loadOwnStatus().then((loadedStatus) => {
      setStatus(loadedStatus)
    })

    // Listen to all conversations from Firebase
    const unsubscribe = conversationManager.listenToAllConversations((realConversations) => {
      setConversations(realConversations)
      setLoading(false)
    })
    
    allConversationsUnsubscribeRef.current = unsubscribe

    return () => {
      if (allConversationsUnsubscribeRef.current) {
        allConversationsUnsubscribeRef.current()
        allConversationsUnsubscribeRef.current = null
      }
    }
  }, [user, isAdmin])

  const handleStatusChange = async (newStatus) => {
    const result = await agentStatus.setStatus(newStatus)
    if (result.success) {
      setStatus(newStatus)
    }
  }

  const handleTakeOver = async (conversationId) => {
    handoffManager.setConversationId(conversationId)
    await handoffManager.adminJoin(user.uid)
    
    // Update conversation in Firebase
    await conversationManager.adminJoinConversation(conversationId, user.uid)
  }

  const handleEndChat = async (conversationId) => {
    handoffManager.setConversationId(conversationId)
    await handoffManager.adminLeave()
    
    // Update conversation in Firebase
    await conversationManager.adminLeaveConversation(conversationId)
  }

  const handleCloseConversation = async (conversationId) => {
    await conversationManager.closeConversation(conversationId)
  }

  const handleDeleteConversation = async (conversationId) => {
    try {
      await conversationManager.deleteConversation(conversationId)
      setSelectedConversation(null)
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const handleAdminReply = async () => {
    if (!selectedConversation || !adminMessage.trim()) return

    try {
      await conversationManager.addMessage(selectedConversation.id, {
        senderId: user.uid,
        senderType: 'admin',
        text: adminMessage
      })
      setAdminMessage('')
    } catch (error) {
      console.error('Error sending admin message:', error)
    }
  }

  const handleSelectConversation = (conversation) => {
    // Clean up previous listener if exists
    if (selectedConversationUnsubscribeRef.current) {
      selectedConversationUnsubscribeRef.current()
      selectedConversationUnsubscribeRef.current = null
    }

    setSelectedConversation(conversation)
    setActiveTab('chat') // Automatically switch to chat tab when conversation is selected
    
    // Listen to conversation messages
    const unsubscribe = conversationManager.listenToConversation(conversation.id, (convData) => {
      setSelectedConversation(convData)
    })

    selectedConversationUnsubscribeRef.current = unsubscribe
  }

  const handleCloseChat = () => {
    // Clean up listener
    if (selectedConversationUnsubscribeRef.current) {
      selectedConversationUnsubscribeRef.current()
      selectedConversationUnsubscribeRef.current = null
    }
    setSelectedConversation(null)
  }

  const getConversationsByState = (state) => {
    return conversations.filter(conv => conv.mode === state)
  }

  const getStats = () => {
    return {
      total: conversations.length,
      waiting: getConversationsByState('waiting-admin').length,
      human: getConversationsByState('human').length,
      bot: getConversationsByState('bot').length
    }
  }

  const stats = getStats()

  // Only admin can access
  if (!user || !isAdmin) {
    return (
      <div className="support-dashboard-access-denied">
        <h1>Access Denied</h1>
        <p>Only admins can access the support dashboard.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="support-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading conversations...</p>
      </div>
    )
  }

  return (
    <div className="support-dashboard">
      <div className="support-dashboard-header">
        <div>
          <h1>OROFEX Support Dashboard</h1>
          <div className="admin-nav">
            <a href="/admin" className="admin-nav-link">← Back to Admin</a>
          </div>
        </div>
        <div className="status-controls">
          <label htmlFor="admin-status">Admin Status:</label>
          <select
            id="admin-status"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="status-select"
          >
            <option value="online">🟢 Online</option>
            <option value="away">🟡 Away</option>
            <option value="offline">🔴 Offline</option>
          </select>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'conversations' ? 'active' : ''}`}
          onClick={() => setActiveTab('conversations')}
        >
          Conversations
        </button>
        <button
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
          disabled={!selectedConversation}
        >
          Chat
        </button>
        <a
          href="/admin/settings"
          className="tab-button owner-settings-link"
        >
          Owner Settings
        </a>
      </div>

      {activeTab === 'overview' && (
        <div className="dashboard-overview">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Conversations</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card waiting">
              <div className="stat-label">Waiting for Admin</div>
              <div className="stat-value">{stats.waiting}</div>
            </div>
            <div className="stat-card human">
              <div className="stat-label">Active Human Chats</div>
              <div className="stat-value">{stats.human}</div>
            </div>
            <div className="stat-card bot">
              <div className="stat-label">AI Handled</div>
              <div className="stat-value">{stats.bot}</div>
            </div>
          </div>

          <div className="recent-conversations">
            <h2>Recent Conversations</h2>
            <div className="conversation-list">
              {conversations.slice(0, 10).map(conv => (
                <div key={conv.id} className="conversation-item" onClick={() => handleSelectConversation(conv)}>
                  <div className="conversation-info">
                    <div className="conversation-customer">{conv.customerName || 'Anonymous'}</div>
                    <div className="conversation-topic">{conv.topic || 'General Support'}</div>
                    <div className="conversation-time">
                      {conv.updatedAt ? new Date(conv.updatedAt.seconds * 1000).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                  <div className={`conversation-state ${conv.mode}`}>
                    {conv.mode === 'waiting-admin' && '🟡 Waiting'}
                    {conv.mode === 'human' && '🟢 Active'}
                    {conv.mode === 'bot' && '🤖 AI'}
                  </div>
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="no-conversations">No conversations yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'conversations' && (
        <div className="dashboard-conversations">
          <div className="conversation-section">
            <h2>Waiting for Admin ({stats.waiting})</h2>
            {getConversationsByState('waiting-admin').map(conv => (
              <div key={conv.id} className="conversation-card" onClick={() => handleSelectConversation(conv)}>
                <div className="conversation-details">
                  <div className="conversation-customer">{conv.customerName || 'Anonymous'}</div>
                  <div className="conversation-topic">{conv.topic || 'General Support'}</div>
                  <div className="conversation-time">
                    {conv.updatedAt ? new Date(conv.updatedAt.seconds * 1000).toLocaleString() : 'Unknown'}
                  </div>
                </div>
                <button
                  className="take-over-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTakeOver(conv.id)
                  }}
                >
                  Take Over
                </button>
              </div>
            ))}
            {getConversationsByState('waiting-admin').length === 0 && (
              <div className="no-conversations">No conversations waiting</div>
            )}
          </div>

          <div className="conversation-section">
            <h2>Active Human Chats ({stats.human})</h2>
            {getConversationsByState('human').map(conv => (
              <div key={conv.id} className="conversation-card active" onClick={() => handleSelectConversation(conv)}>
                <div className="conversation-details">
                  <div className="conversation-customer">{conv.customerName || 'Anonymous'}</div>
                  <div className="conversation-topic">{conv.topic || 'General Support'}</div>
                  <div className="conversation-time">
                    {conv.updatedAt ? new Date(conv.updatedAt.seconds * 1000).toLocaleString() : 'Unknown'}
                  </div>
                </div>
                <button
                  className="end-chat-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEndChat(conv.id)
                  }}
                >
                  End Chat
                </button>
              </div>
            ))}
            {getConversationsByState('human').length === 0 && (
              <div className="no-conversations">No active human chats</div>
            )}
          </div>

          <div className="conversation-section">
            <h2>AI Handled ({stats.bot})</h2>
            {getConversationsByState('bot').map(conv => (
              <div key={conv.id} className="conversation-card bot" onClick={() => handleSelectConversation(conv)}>
                <div className="conversation-details">
                  <div className="conversation-customer">{conv.customerName || 'Anonymous'}</div>
                  <div className="conversation-topic">{conv.topic || 'General Support'}</div>
                  <div className="conversation-time">
                    {conv.updatedAt ? new Date(conv.updatedAt.seconds * 1000).toLocaleString() : 'Unknown'}
                  </div>
                </div>
                <div className="conversation-actions">
                  <button
                    className="take-over-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTakeOver(conv.id)
                    }}
                  >
                    Take Over
                  </button>
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteConversation(conv.id)
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {getConversationsByState('bot').length === 0 && (
              <div className="no-conversations">No AI handled conversations</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'chat' && selectedConversation && (
        <div className="dashboard-chat">
          <div className="chat-header">
            <h3>Chat with {selectedConversation.customerName || 'Anonymous'}</h3>
            <button className="close-chat-button" onClick={handleCloseChat}>
              ×
            </button>
          </div>
          <div className="chat-messages">
            {selectedConversation.messages && selectedConversation.messages
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
              .map((msg, index) => (
              <div key={index} className={`chat-message ${msg.senderType}`}>
                <div className="message-sender">
                  {msg.senderType === 'customer' && 'Customer'}
                  {msg.senderType === 'admin' && 'You'}
                  {msg.senderType === 'ai' && 'AI'}
                  {msg.senderType === 'system' && '⚡ System'}
                </div>
                <div className="message-text">{msg.text}</div>
                <div className="message-time">
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                </div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleAdminReply()}
            />
            <button onClick={handleAdminReply} className="send-button">
              Send
            </button>
          </div>
          <div className="chat-actions">
            {selectedConversation.mode === 'human' && (
              <button className="return-ai-button" onClick={() => handleEndChat(selectedConversation.id)}>
                Return to AI
              </button>
            )}
            <button className="close-conversation-button" onClick={() => handleCloseConversation(selectedConversation.id)}>
              Close Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupportDashboard
