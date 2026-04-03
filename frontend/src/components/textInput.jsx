import { useState } from 'react'
import './textInput.css'

const PLACEHOLDER = `Paste your source document, product brief, or article here…

Example:
"We're launching FeatureX — an AI-powered analytics dashboard that reduces report generation time by 80%. Integrates natively with Slack, Notion, and Jira. Built for SaaS product teams who need weekly digests, anomaly detection, and one-click sharing without leaving their tools."`

export default function TextInput({ onSubmit, loading }) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (!text.trim() || loading) return
    onSubmit(text.trim())
  }

  const handleKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="text-input-wrapper">
      <div className="ti-header">
        <span className="ti-label">Source Document</span>
        <span className="ti-hint">Paste any raw content to begin</span>
      </div>

      <div className={`ti-box ${loading ? 'ti-loading' : ''}`}>
        <textarea
          className="ti-textarea"
          placeholder={PLACEHOLDER}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          rows={7}
        />

        <div className="ti-footer">
          <div className="ti-meta">
            <span className="ti-char-count">
              {text.length > 0 ? `${text.length} chars` : ''}
            </span>
            <span className="ti-shortcut">
              <kbd>⌘</kbd> + <kbd>↵</kbd> to run
            </span>
          </div>
          <button
            className={`ti-submit ${loading ? 'ti-submit--loading' : ''}`}
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
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