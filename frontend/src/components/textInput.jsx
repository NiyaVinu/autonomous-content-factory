import { useState } from 'react'
import './textInput.css'

const PLACEHOLDER = `Paste your source document, product brief, or article here…

Example:
"We're launching FeatureX — an AI-powered analytics dashboard that reduces report generation time by 80%. Integrates natively with Slack, Notion, and Jira. Built for SaaS product teams who need weekly digests, anomaly detection, and one-click sharing without leaving their tools."`

const URL_PLACEHOLDER = `Paste a URL to analyze its content…

Example: https://example.com/product-announcement`

export default function TextInput({ onSubmit, loading }) {
  const [mode, setMode] = useState('text') // 'text' or 'url'
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')

  const isUrl = (str) => {
    try {
      new URL(str.startsWith('http') ? str : `https://${str}`)
      return str.includes('.')
    } catch {
      return false
    }
  }

  const handleSubmit = () => {
    if (loading) return
    if (mode === 'url') {
      if (!url.trim()) return
      onSubmit(`__URL__${url.trim()}`)
    } else {
      if (!text.trim()) return
      onSubmit(text.trim())
    }
  }

  const handleKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
  }

  const canSubmit = mode === 'url' ? url.trim().length > 0 : text.trim().length > 0

  return (
    <div className="text-input-wrapper">
      <div className="ti-header">
        <span className="ti-label">Source Document</span>
        <div className="ti-mode-toggle">
          <button
            className={`ti-mode-btn ${mode === 'text' ? 'ti-mode-btn--active' : ''}`}
            onClick={() => setMode('text')}
            disabled={loading}
          >
            📄 Paste Text
          </button>
          <button
            className={`ti-mode-btn ${mode === 'url' ? 'ti-mode-btn--active' : ''}`}
            onClick={() => setMode('url')}
            disabled={loading}
          >
            🔗 From URL
          </button>
        </div>
        <span className="ti-hint">
          {mode === 'text' ? 'Paste any raw content to begin' : 'Enter a URL to analyze'}
        </span>
      </div>

      <div className={`ti-box ${loading ? 'ti-loading' : ''}`}>
        {mode === 'text' ? (
          <textarea
            className="ti-textarea"
            placeholder={PLACEHOLDER}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            rows={7}
          />
        ) : (
          <div className="ti-url-wrapper">
            <span className="ti-url-icon">🔗</span>
            <input
              className="ti-url-input"
              placeholder={URL_PLACEHOLDER}
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              type="text"
            />
          </div>
        )}

        <div className="ti-footer">
          <div className="ti-meta">
            <span className="ti-char-count">
              {mode === 'text' && text.length > 0 ? `${text.length} chars` : ''}
              {mode === 'url' && url.length > 0 ? url : ''}
            </span>
            <span className="ti-shortcut">
              <kbd>⌘</kbd> + <kbd>↵</kbd> to run
            </span>
          </div>
          <button
            className={`ti-submit ${loading ? 'ti-submit--loading' : ''}`}
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <><span className="ti-spinner" />Processing</>
            ) : (
              <><span className="ti-run-icon">▶</span>Run Pipeline</>
            )}
          </button>
        </div>
      </div>

      <p className="ti-sub">
        Agent 1 extracts a verified Fact-Sheet · Agent 2 writes Blog, Social &amp; Email simultaneously
      </p>
    </div>
  )
}