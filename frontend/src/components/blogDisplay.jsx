import React from 'react';
import './BlogDisplay.css';

function BlogDisplay({ blog }) {
  if (!blog) return null;

  return (
    <div className="blog-container">
      <div className="content-header">
        <h3>📖 Blog Post</h3>
        {blog.word_count && (
          <span className="word-count">{blog.word_count} words</span>
        )}
      </div>
      
      <div className="blog-content">
        <h2 className="blog-title">{blog.title || 'Blog Post'}</h2>
        
        {blog.plain_text ? (
          <div className="blog-text">
            {blog.plain_text.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : blog.content ? (
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        ) : (
          <p>No content available</p>
        )}
        
        {blog.style && (
          <div className="content-meta">
            <span className="style-badge">Style: {blog.style}</span>
          </div>
        )}
      </div>
      
      <div className="content-actions">
        <button 
          className="copy-btn"
          onClick={() => {
            const text = blog.plain_text || blog.content?.replace(/<[^>]*>/g, '');
            navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
          }}
        >
          📋 Copy to Clipboard
        </button>
      </div>
    </div>
  );
}

export default BlogDisplay;