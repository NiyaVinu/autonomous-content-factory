import './agentStatus.css'

const AGENTS = {
  factCheck: {
    number: '01',
    label: 'Fact-Check & Research',
    role: 'The Analytical Brain',
    desc: 'Reads source · Extracts features, specs & audience · Builds verified Fact-Sheet',
    accent: 'teal',
  },
  copywriter: {
    number: '02',
    label: 'Creative Copywriter',
    role: 'The Voice',
    desc: 'Reads Fact-Sheet · Writes Blog, Social Thread & Email · Enforces tone per platform',
    accent: 'amber',
  },
}

export default function AgentStatus({ states = {} }) {
  return (
    <div className="agent-status">
      <div className="as-header">
        <span className="as-title">Pipeline Execution</span>
        <div className="as-track">
          <div
            className="as-track-fill"
            style={{ width: getProgress(states) }}
          />
        </div>
        <span className="as-pct">{getProgress(states)}</span>
      </div>

      <div className="as-grid">
        {Object.entries(AGENTS).map(([key, meta]) => {
          const state = states[key] || 'idle'
          return (
            <div key={key} className={`as-card as-card--${state} as-card--${meta.accent}`}>
              <div className="as-card-top">
                <span className="as-num">{meta.number}</span>
                <div className={`as-state-badge as-state--${state}`}>
                  {state === 'idle'    && 'WAITING'}
                  {state === 'running' && <><span className="as-pulse" />RUNNING</>}
                  {state === 'done'    && <>✓ DONE</>}
                  {state === 'error'   && <>✗ ERROR</>}
                </div>
              </div>

              <div className="as-card-body">
                <div className="as-label">{meta.label}</div>
                <div className="as-role">{meta.role}</div>
                <p className="as-desc">{meta.desc}</p>
              </div>

              {state === 'running' && (
                <div className="as-progress-bar">
                  <div className="as-progress-fill" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getProgress(states) {
  const done = Object.values(states).filter(s => s === 'done').length
  const total = Object.keys(AGENTS).length
  return `${Math.round((done / total) * 100)}%`
}