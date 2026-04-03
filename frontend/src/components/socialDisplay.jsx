import { useState } from 'react'
import { formatSocial } from '../utils/formatters'
import './socialDisplay.css'

export default function SocialDisplay({ content }) {
  const [copied, setCopied] = useState(false)

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
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? '✓ Copied' : '⎘ Copy'}
        </button>
      </div>

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
    </div>
  )
}