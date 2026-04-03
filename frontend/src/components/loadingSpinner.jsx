import './loadingSpinner.css'

export default function LoadingSpinner({ label = 'Processing…' }) {
  return (
    <div className="ls-wrap">
      <div className="ls-ring" />
      <span className="ls-label">{label}</span>
    </div>
  )
}