import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import './AgentStatus.css';

function AgentStatus({ status, logs, loading }) {
  if (!loading && logs.length === 0) {
    return null;
  }

  const getAgentIcon = (log) => {
    if (log.includes('Analyzing')) return '🔍';
    if (log.includes('Research')) return '🧠';
    if (log.includes('Copywriter')) return '✍️';
    if (log.includes('Editor')) return '📝';
    if (log.includes('Completed')) return '✅';
    if (log.includes('Error')) return '❌';
    return '🤖';
  };

  return (
    <div className="agent-status-container">
      <div className="status-header">
        <h3>🤖 Agent Activity</h3>
        {loading && <LoadingSpinner />}
      </div>
      
      <div className="status-badge">
        <span className={`status-indicator ${loading ? 'active' : 'idle'}`}></span>
        <span className="status-text">{status}</span>
      </div>
      
      <div className="logs-container">
        {logs.map((log, index) => (
          <div key={index} className="log-entry">
            <span className="log-icon">{getAgentIcon(log.message)}</span>
            <span className="log-message">{log.message}</span>
            <span className="log-time">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AgentStatus;