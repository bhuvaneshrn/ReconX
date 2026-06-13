import { AlertTriangle, CheckCircle, Info, XCircle, Sparkles } from 'lucide-react'
import type { AISummary, KeyFinding } from '../utils/types'

interface Props {
  data: AISummary
}

const RISK_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  Low:      { color: 'text-green-400',  bg: 'bg-green-900/20',  border: 'border-green-800/50', label: 'LOW' },
  Medium:   { color: 'text-amber-400',  bg: 'bg-amber-900/20',  border: 'border-amber-800/50', label: 'MEDIUM' },
  High:     { color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-800/50', label: 'HIGH' },
  Critical: { color: 'text-red-400',    bg: 'bg-red-900/20',    border: 'border-red-800/50',   label: 'CRITICAL' },
  Unknown:  { color: 'text-slate-400',  bg: 'bg-slate-900/20',  border: 'border-slate-700',    label: 'UNKNOWN' },
}

function SeverityIcon({ severity }: { severity: KeyFinding['severity'] }) {
  const cls = 'flex-shrink-0 mt-0.5'
  if (severity === 'high')   return <XCircle    size={14} className={`${cls} text-orange-400`} />
  if (severity === 'medium') return <AlertTriangle size={14} className={`${cls} text-amber-400`} />
  if (severity === 'low')    return <CheckCircle size={14} className={`${cls} text-green-400`} />
  return <Info size={14} className={`${cls} text-blue-400`} />
}

export function AISummaryPanel({ data }: Props) {
  if (data.error) {
    return (
      <div className="card p-6 border-orange-800/30">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-300 mb-1">AI Summary unavailable</p>
            <p className="text-xs text-slate-500 font-mono">{data.error}</p>
          </div>
        </div>
      </div>
    )
  }

  const risk = RISK_CONFIG[data.overall_risk] ?? RISK_CONFIG.Unknown

  return (
    <div className="space-y-5">
      {/* Risk banner */}
      <div className={`rounded-xl border px-5 py-4 flex items-center gap-4 ${risk.bg} ${risk.border}`}>
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-1">Overall Risk</p>
          <p className={`text-2xl font-mono font-bold ${risk.color}`}>{risk.label}</p>
        </div>
        <Sparkles size={28} className={`${risk.color} opacity-60`} />
      </div>

      {/* Plain summary */}
      {data.plain_summary && (
        <div className="card p-5">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Summary</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{data.plain_summary}</p>
        </div>
      )}

      {/* Key findings */}
      {data.key_findings && data.key_findings.length > 0 && (
        <div className="card p-5">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
            Key Findings ({data.key_findings.length})
          </h3>
          <ul className="space-y-3">
            {data.key_findings.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <SeverityIcon severity={f.severity} />
                <div className="flex-1 min-w-0">
                  <span
                    className={`badge mr-2 ${
                      f.severity === 'high'   ? 'tag-high'   :
                      f.severity === 'medium' ? 'tag-medium' :
                      f.severity === 'low'    ? 'tag-low'    :
                      'tag-info'
                    }`}
                  >
                    {f.severity}
                  </span>
                  <span className="text-sm text-slate-300">{f.finding}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="card p-5">
          <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
            Recommendations
          </h3>
          <ul className="space-y-2.5">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-xs font-mono text-cyan-600 mt-0.5 flex-shrink-0 w-5 text-right">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-slate-300">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
