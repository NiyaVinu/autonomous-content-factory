import { useState } from 'react'
import { formatSocial } from '../utils/formatters'
import './socialDisplay.css'

export default function SocialDisplay({ content }) {
  const [copied, setCopied] = useState(false)
  const [previewMode, setPreviewMode] = useState('desktop') // 'desktop' or 'mobile'

  if (!content) return <div className="display-empty">— Social thread will appear here —</div>

  const posts = formatSocial(content)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="social-display">
      <div className="sd-topbar">
        <div className="sd-tags">
          <span className="tag tag--blue">SOCIAL THREAD</span>
          <span className="tag tag--dim">PUNCHY TONE</span>
          <span className="tag tag--dim">{posts.length} POSTS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mobile/Desktop toggle */}
          <div className="sd-preview-toggle">
            <button
              className={`sd-preview-btn ${previewMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setPreviewMode('desktop')}
              title="Desktop view"
            >
              🖥 Desktop
            </button>
            <button
              className={`sd-preview-btn ${previewMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setPreviewMode('mobile')}
              title="Mobile view"
            >
              📱 Mobile
            </button>
          </div>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? '✓ Copied' : '⎘ Copy'}
          </button>
        </div>
      </div>

      {/* Desktop view */}
      {previewMode === 'desktop' && (
        <div className="sd-card">
          {posts.map((post, i) => (
            <div key={i} className="sd-post">
              <div className="sd-left">
                <div className="sd-avatar">
                  <span>CF</span>
                </div>
                {i < posts.length - 1 && <div className="sd-line" />}
              </div>
              <div className="sd-right">
                <div className="sd-meta">
                  <span className="sd-name">Content Factory</span>
                  <span className="sd-handle">@contentfactory</span>
                  <span className="sd-counter">{i + 1}/{posts.length}</span>
                </div>
                <p className="sd-text">{post}</p>
                <div className="sd-actions">
                  <span className="sd-action">↩ Reply</span>
                  <span className="sd-action">↺ Repost</span>
                  <span className="sd-action">♡ Like</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile view */}
      {previewMode === 'mobile' && (
        <div className="sd-mobile-wrapper">
          <div className="sd-mobile-frame">
            {/* Phone notch */}
            <div className="sd-mobile-notch">
              <div className="sd-mobile-notch-bar" />
            </div>

            {/* App header */}
            <div className="sd-mobile-header">
              <span className="sd-mobile-back">←</span>
              <span className="sd-mobile-title">Thread</span>
              <span className="sd-mobile-more">···</span>
            </div>

            {/* Posts */}
            <div className="sd-mobile-feed">
              {posts.map((post, i) => (
                <div key={i} className="sd-mobile-post">
                  <div className="sd-mobile-left">
                    <div className="sd-mobile-avatar">
                      <span>CF</span>
                    </div>
                    {i < posts.length - 1 && <div className="sd-mobile-line" />}
                  </div>
                  <div className="sd-mobile-right">
                    <div className="sd-mobile-meta">
                      <span className="sd-mobile-name">Content Factory</span>
                      <span className="sd-mobile-handle">@contentfactory</span>
                    </div>
                    <p className="sd-mobile-text">{post}</p>
                    <div className="sd-mobile-actions">
                      <span>↩</span>
                      <span>↺</span>
                      <span>♡</span>
                      <span>↑</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Home bar */}
            <div className="sd-mobile-homebar" />
          </div>
        </div>
      )}
    </div>
  )
}