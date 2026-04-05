import './reviewDisplay.css'

export default function ReviewDisplay({ review }) {
  if (!review) return null

  const status = review.status || 'APPROVED'
  const scores = review.scores || {}
  const criticalIssues = review.critical_issues || []
  const warnings = review.warnings || []
  const improvements = review.improvements || []

  const statusColor = {
    'APPROVED': 'teal',
    'APPROVED_WITH_WARNINGS': 'amber',
    'REJECTED': 'red'
  }[status] || 'teal'

  const statusLabel = {
    'APPROVED': '✓ Approved',
    'APPROVED_WITH_WARNINGS': '⚠ Approved with Warnings',
    'REJECTED': '✗ Rejected'
  }[status] || status

  return (
    <div className="review-display">
      <div className="rv-header">
        <div className="rv-header-left">
          <span className="rv-badge">AGENT 03 · EDITOR-IN-CHIEF</span>
          <span className={`rv-status rv-status--${statusColor}`}>{statusLabel}</span>
        </div>
        {scores.overall !== undefined && (
          <div className="rv-overall-score">
            <span className="rv-score-label">QUALITY SCORE</span>
            <span className={`rv-score-value rv-score--${getScoreColor(scores.overall)}`}>
              {scores.overall}/100
            </span>
          </div>
        )}
      </div>

      {/* Score breakdown */}
      {Object.keys(scores).length > 1 && (
        <div className="rv-scores">
          {Object.entries(scores).filter(([k]) => k !== 'overall').map(([key, value]) => (
            <div key={key} className="rv-score-item">
              <div className="rv-score-item-header">
                <span className="rv-score-item-label">{formatScoreKey(key)}</span>
                <span className={`rv-score-item-value rv-score--${getScoreColor(value)}`}>{value}</span>
              </div>
              <div className="rv-score-bar">
                <div
                  className={`rv-score-bar-fill rv-score-bar--${getScoreColor(value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <div className="rv-section">
          <div className="rv-section-header rv-section-header--red">
            <span>✗ Critical Issues ({criticalIssues.length})</span>
          </div>
          {criticalIssues.map((issue, i) => (
            <div key={i} className="rv-issue rv-issue--critical">
              <span className="rv-issue-msg">{issue.message}</span>
              {issue.suggestion && (
                <span className="rv-issue-suggestion">→ {issue.suggestion}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rv-section">
          <div className="rv-section-header rv-section-header--amber">
            <span>⚠ Warnings ({warnings.length})</span>
          </div>
          {warnings.map((warning, i) => (
            <div key={i} className="rv-issue rv-issue--warning">
              <span className="rv-issue-msg">{warning.message}</span>
              {warning.suggestion && (
                <span className="rv-issue-suggestion">→ {warning.suggestion}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <div className="rv-section">
          <div className="rv-section-header rv-section-header--blue">
            <span>💡 Suggested Improvements ({improvements.length})</span>
          </div>
          {improvements.map((improvement, i) => (
            <div key={i} className="rv-issue rv-issue--improvement">
              <span className="rv-issue-msg">{improvement.message}</span>
              {improvement.suggestion && (
                <span className="rv-issue-suggestion">→ {improvement.suggestion}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recommendation */}
      {review.recommendation && (
        <div className="rv-recommendation">
          <span className="rv-recommendation-label">RECOMMENDATION</span>
          <span className="rv-recommendation-text">{review.recommendation}</span>
        </div>
      )}
    </div>
  )
}

function getScoreColor(score) {
  if (score >= 80) return 'good'
  if (score >= 60) return 'medium'
  return 'poor'
}

function formatScoreKey(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}