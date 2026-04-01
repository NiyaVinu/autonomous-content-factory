import React from 'react';
import './TextInput.css';

function TextInput({ value, onChange, onGenerate, onClear, loading }) {
  return (
    <div className="text-input-container">
      <label className="input-label">
        📝 Enter your content to analyze:
      </label>
      <textarea
        className="text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your product description, technical document, or any content here...
        
Example:
Introducing ContentMaster Pro, an AI-powered platform for marketing teams. Features include intelligent content repurposing, brand voice consistency, and multi-channel publishing. The platform saves teams up to 10 hours per week and improves engagement by 45%."
        rows={8}
        disabled={loading}
      />
      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={onGenerate}
          disabled={loading || !value.trim()}
        >
          {loading ? 'Generating...' : '🚀 Generate Content'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={onClear}
          disabled={loading}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default TextInput;