import { useState } from 'react'
import { formatBlog } from '../utils/formatters'
import './blogDisplay.css'

export default function BlogDisplay({ content }) {
  const [copied, setCopied] = useState(false)

  if (!content) return <div className="display-empty">— Blog post will appear here —</div>

  const { title, body, wordCount } = formatBlog(content)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="blog-display">
      <div className="bd-topbar">
        <div className="bd-tags">
          <span className="tag tag--amber">BLOG POST</span>
          <span className="tag tag--dim">PROFESSIONAL TONE</span>
          {wordCount && <span className="tag tag--dim">{wordCount} WORDS</span>}
        </div>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? '✓ Copied' : '⎘ Copy'}
        </button>
      </div>

      <div className="bd-card">
        {title && (
          <div className="bd-title-block">
            <h2 className="bd-title">{title}</h2>
            <div className="bd-title-rule" />
          </div>
        )}
        <div 
  className="bd-body"
  dangerouslySetInnerHTML={{ __html: body.join('\n') }}
/>
      </div>
    </div>
  )
}