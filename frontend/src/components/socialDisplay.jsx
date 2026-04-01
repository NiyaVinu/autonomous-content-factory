import React from 'react';
import './SocialDisplay.css';

function SocialDisplay({ social }) {
  if (!social) return null;

  const thread = social.thread || [];
  const formattedThread = social.formatted_thread;

  return (
    <div className="social-container">
      <div className="content-header">
        <h3>🐦 Social Media Thread</h3>
        <span className="tweet-count">{thread.length || 5} tweets</span>
      </div>
      
      <div className="social-content">
        {thread.length > 0 ? (
          <div className="thread-container">
            {thread.map((tweet, index) => (
              <div key={index} className="tweet-card">
                <div className="tweet-header">
                  <span className="tweet-number">{index + 1}/{thread.length}</span>
                  <span className="tweet-icon">🐦</span>
                </div>
                <div className="tweet-content">{tweet}</div>
              </div>
            ))}
          </div>
        ) : formattedThread ? (
          <div className="thread-text">
            {formattedThread.split('\n\n').map((tweet, index) => (
              <div key={index} className="tweet-card">
                <div className="tweet-content">{tweet}</div>
              </div>
            ))}
          </div>
        ) : (
          <p>No social media content available</p>
        )}
        
        {social.style && (
          <div className="content-meta">
            <span className="style-badge">Style: {social.style}</span>
          </div>
        )}
      </div>
      
      <div className="content-actions">
        <button 
          className="copy-btn"
          onClick={() => {
            const text = thread.join('\n\n') || formattedThread;
            navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
          }}
        >
          📋 Copy Thread
        </button>
      </div>
    </div>
  );
}

export default SocialDisplay;