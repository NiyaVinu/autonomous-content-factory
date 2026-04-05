import { useState } from 'react'
import './emailDisplay.css'

export default function EmailDisplay({ content }) {
  const [copied, setCopied] = useState(false)
  const [ctaUrl, setCtaUrl] = useState('')

  if (!content) return <div className="display-empty">— Email teaser will appear here —</div>

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length

  return (
    <div className="email-display">
      <div className="em-topbar">
        <div className="em-tags">
          <span className="tag tag--teal">EMAIL TEASER</span>
          <span className="tag tag--dim">WARM DIRECT TONE</span>
          <span className="tag tag--dim">{wordCount} WORDS</span>
        </div>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? '✓ Copied' : '⎘ Copy'}
        </button>
      </div>

      <div className="em-card">
        <div className="em-chrome">
          <div className="em-chrome-dots">
            <span className="em-dot em-dot--red" />
            <span className="em-dot em-dot--amber" />
            <span className="em-dot em-dot--green" />
          </div>
          <span className="em-chrome-title">New Message — Mail</span>
          <div style={{ flex: 1 }} />
        </div>

        <div className="em-fields">
          <div className="em-field">
            <span className="em-field-key">To</span>
            <span className="em-field-val">subscribers@yourlist.com</span>
          </div>
          <div className="em-field">
            <span className="em-field-key">From</span>
            <span className="em-field-val">hello@yourproduct.com</span>
          </div>
          <div className="em-field em-field--subject">
            <span className="em-field-key">Subject</span>
            <span className="em-field-val em-subject">You need to see what we just built →</span>
          </div>
          <div className="em-field">
            <span className="em-field-key">CTA URL</span>
            <input
              className="em-url-input"
              type="text"
              placeholder="https://yourproduct.com/demo"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="em-body">
          <p className="em-greeting">Hi there,</p>
          <div className="em-text">
            {content.split('\n').map((line, i) => (
              <p key={i} style={{ margin: '0 0 8px 0', minHeight: line ? 'auto' : '8px' }}>
                {line}
              </p>
            ))}
          </div>
          <div className="em-cta-block">
            {ctaUrl ? (
              <a
                className="em-cta"
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                See it in action →
              </a>
            ) : (
              <span className="em-cta" style={{ opacity: 0.5, cursor: 'default' }}>
                See it in action → (enter URL above)
              </span>
            )}
          </div>
          <div className="em-sig">
            <span className="em-sig-name">The Team</span>
            <span className="em-sig-company">Content Factory</span>
          </div>
        </div>
      </div>
    </div>
  )
}