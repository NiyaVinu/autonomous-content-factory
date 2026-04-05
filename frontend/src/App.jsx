import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useState } from 'react'
import TextInput from './components/textInput'
import AgentStatus from './components/agentStatus'
import BlogDisplay from './components/blogDisplay'
import SocialDisplay from './components/socialDisplay'
import EmailDisplay from './components/emailDisplay'
import ReviewDisplay from './components/reviewDisplay'
import useContentGeneration from './hooks/useContentGeneration'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('blog')
  const [approved, setApproved] = useState({})
  const [lastInput, setLastInput] = useState('')
  const [viewMode, setViewMode] = useState('output')
  const { generateContent, loading, content: results, error, agentStates, chatFeed, review } = useContentGeneration()

  const tabs = [
    { id: 'blog',   label: 'Blog Post',     icon: '✍️' },
    { id: 'social', label: 'Social Thread', icon: '🔗' },
    { id: 'email',  label: 'Email Teaser',  icon: '📧' },
  ]

  const handleApprove = (tab) => {
    setApproved(prev => ({ ...prev, [tab]: true }))
  }

  const handleRegenerate = (tab) => {
    setApproved(prev => ({ ...prev, [tab]: false }))
  }

  const showAgentRoom = loading || agentStates.factCheck !== 'idle' || agentStates.copywriter !== 'idle'

  const getSourceText = () => {
    if (!lastInput) return ''
    if (lastInput.startsWith('__URL__')) {
      return `Source URL: ${lastInput.replace('__URL__', '')}`
    }
    return lastInput
  }

  const handleExport = async () => {
    if (!results) return

    const zip = new JSZip()
    const folder = zip.folder('campaign-kit')

    folder.file('blog-post.html', `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Blog Post</title></head>
<body style="font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px">
${results.blog}
</body>
</html>`)

    folder.file('social-thread.txt', results.social)
    folder.file('email-teaser.txt', results.email)

    if (results.factSheet) {
      folder.file('fact-sheet.json', JSON.stringify(results.factSheet, null, 2))
    }

    if (review) {
      folder.file('editor-review.json', JSON.stringify(review, null, 2))
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'campaign-kit.zip')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo-block">
            <span className="logo-badge">USE CASE #4</span>
            <div className="logo-divider" />
            <h1 className="logo-title">Autonomous Content Factory</h1>
          </div>
          <p className="header-tagline">
            Three AI agents · fact-check, write &amp; review · blog, social &amp; email
          </p>
          <div className="header-status">
            <div className="status-dot" />
            SYSTEM ONLINE
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="input-section">
          <TextInput
            onSubmit={(text) => { setLastInput(text); generateContent(text); }}
            loading={loading}
          />
        </section>

        {showAgentRoom && (
          <section className="agents-section">
            <AgentStatus states={agentStates} />

            {chatFeed.length > 0 && (
              <div className="chat-feed">
                <div className="chat-feed-header">
                  <span className="chat-feed-title">AGENT COMMUNICATION LOG</span>
                  <span className="chat-feed-count">{chatFeed.length} MESSAGES</span>
                </div>
                <div className="chat-feed-body">
                  {chatFeed.map(msg => (
                    <div key={msg.id} className={`chat-msg chat-msg--${msg.agent} chat-msg--${msg.type}`}>
                      <span className="chat-msg-badge">
                        {msg.agent === 'factCheck' ? 'AGENT 01' : msg.agent === 'copywriter' ? 'AGENT 02' : 'AGENT 03'}
                      </span>
                      <span className="chat-msg-time">{msg.time}</span>
                      <span className="chat-msg-text">{msg.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {error && (
          <div className="error-banner">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {results && (
          <section className="results-section">
            <div className="results-header">
              <span className="results-title">Generated Output</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="view-toggle">
                  <button
                    className={`view-toggle-btn ${viewMode === 'output' ? 'active' : ''}`}
                    onClick={() => setViewMode('output')}
                  >
                    📄 Output
                  </button>
                  <button
                    className={`view-toggle-btn ${viewMode === 'compare' ? 'active' : ''}`}
                    onClick={() => setViewMode('compare')}
                  >
                    ⇔ Compare
                  </button>
                </div>
                <button className="export-btn" onClick={handleExport}>
                  ⬇ Export Campaign Kit
                </button>
                <div className="tab-bar">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="tab-icon">{tab.icon}</span>
                      {tab.label}
                      {approved[tab.id] && <span className="tab-approved">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {viewMode === 'output' && (
              <div className="results-body">
                {activeTab === 'blog'   && <BlogDisplay   content={results.blog}   />}
                {activeTab === 'social' && <SocialDisplay content={results.social} />}
                {activeTab === 'email'  && <EmailDisplay  content={results.email}  />}
              </div>
            )}

            {viewMode === 'compare' && (
              <div className="compare-view">
                <div className="compare-panel">
                  <div className="compare-panel-header">
                    <span className="compare-badge compare-badge--source">SOURCE</span>
                    <span className="compare-panel-title">Original Input</span>
                  </div>
                  <div className="compare-panel-body">
                    <pre className="compare-source-text">{getSourceText()}</pre>
                  </div>
                </div>
                <div className="compare-divider">
                  <div className="compare-divider-line" />
                  <span className="compare-divider-icon">⇔</span>
                  <div className="compare-divider-line" />
                </div>
                <div className="compare-panel">
                  <div className="compare-panel-header">
                    <span className="compare-badge compare-badge--output">OUTPUT</span>
                    <span className="compare-panel-title">
                      {tabs.find(t => t.id === activeTab)?.label}
                    </span>
                  </div>
                  <div className="compare-panel-body">
                    {activeTab === 'blog' && (
                      <div dangerouslySetInnerHTML={{ __html: results.blog }} />
                    )}
                    {activeTab === 'social' && (
                      <pre className="compare-source-text">{results.social}</pre>
                    )}
                    {activeTab === 'email' && (
                      <div>
                        {results.email.split('\n').map((line, i) => (
                          <p key={i} style={{ margin: '0 0 8px 0', minHeight: line ? 'auto' : '8px' }}>
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="content-actions">
              {approved[activeTab] ? (
                <div className="approved-banner">
                  <span>✓ {tabs.find(t => t.id === activeTab)?.label} Approved</span>
                  <button className="action-btn action-btn--ghost" onClick={() => handleRegenerate(activeTab)}>
                    ↺ Regenerate
                  </button>
                </div>
              ) : (
                <div className="action-bar">
                  <button className="action-btn action-btn--approve" onClick={() => handleApprove(activeTab)}>
                    ✓ Approve {tabs.find(t => t.id === activeTab)?.label}
                  </button>
                  <button className="action-btn action-btn--regenerate" onClick={() => { setApproved({}); generateContent(lastInput); }}>
                    ↺ Regenerate
                  </button>
                </div>
              )}
            </div>

            {/* Editor Review Panel */}
            {review && <ReviewDisplay review={review} />}

            {results.factSheet && (
              <details className="fact-sheet-details">
                <summary className="fact-sheet-summary">
                  <span className="fs-badge">AGENT 1 OUTPUT</span>
                  View Verified Fact-Sheet
                </summary>
                <pre className="fact-sheet-pre">{
                  typeof results.factSheet === 'string'
                    ? results.factSheet
                    : JSON.stringify(results.factSheet, null, 2)
                }</pre>
              </details>
            )}
          </section>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span>AUTONOMOUS CONTENT FACTORY</span>
            <span className="footer-dot">·</span>
            <span>POWERED BY CLAUDE</span>
            <span className="footer-dot">·</span>
            <span>THREE-AGENT PIPELINE</span>
          </div>
        </div>
      </footer>
    </div>
  )
}