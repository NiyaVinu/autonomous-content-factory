
import { useState } from 'react'
import TextInput from './components/textInput'
import AgentStatus from './components/agentStatus'
import BlogDisplay from './components/blogDisplay'
import SocialDisplay from './components/socialDisplay'
import EmailDisplay from './components/emailDisplay'
import useContentGeneration from './hooks/useContentGeneration'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('blog')
  const { generateContent: generate, loading, content: results, error } = useContentGeneration()
  const tabs = [
    { id: 'blog',   label: 'Blog Post',      icon: '✍️' },
    { id: 'social', label: 'Social Thread',  icon: '🔗' },
    { id: 'email',  label: 'Email Teaser',   icon: '📧' },
  ]

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
            Two AI agents · fact-check then write · blog, social &amp; email
          </p>
          <div className="header-status">
            <div className="status-dot" />
            SYSTEM ONLINE
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="input-section">
          <TextInput onSubmit={generate} loading={loading} />
        </section>

        {loading && (
  <section className="agents-section">
    <AgentStatus states={{}} />
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
              <div className="tab-bar">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="results-body">
              {activeTab === 'blog'   && <BlogDisplay   content={results.blog}   />}
              {activeTab === 'social' && <SocialDisplay content={results.social} />}
              {activeTab === 'email'  && <EmailDisplay  content={results.email}  />}
            </div>

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
            <span>TWO-AGENT PIPELINE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}