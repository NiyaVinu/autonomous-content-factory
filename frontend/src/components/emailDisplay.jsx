import React from 'react';
import './EmailDisplay.css';

function EmailDisplay({ email }) {
  if (!email) return null;

  return (
    <div className="email-container">
      <div className="content-header">
        <h3>📧 Email Teaser</h3>
        {email.word_count && (
          <span className="word-count">{email.word_count} words</span>
        )}
      </div>
      
      <div className="email-content">
        {email.subject && (
          <div className="email-subject">
            <strong>Subject:</strong> {email.subject}
          </div>
        )}
        
        {email.preview_text && (
          <div className="email-preview">
            <strong>Preview:</strong> {email.preview_text}
          </div>
        )}
        
        <div className="email-body">
          {email.body ? (
            email.body.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))
          ) : email.formatted_email ? (
            <p>{email.formatted_email}</p>
          ) : (
            <p>No email content available</p>
          )}
        </div>
        
        {email.style && (
          <div className="content-meta">
            <span className="style-badge">Style: {email.style}</span>
          </div>
        )}
      </div>
      
      <div className="content-actions">
        <button 
          className="copy-btn"
          onClick={() => {
            const text = email.body || email.formatted_email;
            navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
          }}
        >
          📋 Copy Email
        </button>
      </div>
    </div>
  );
}

export default EmailDisplay;