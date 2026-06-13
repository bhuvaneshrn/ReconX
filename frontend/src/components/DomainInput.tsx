import { useState, type FormEvent } from 'react'
import { Search, AlertTriangle } from 'lucide-react'
import type { ReconStatus } from '../utils/types'

interface Props {
  status: ReconStatus
  onSubmit: (domain: string) => void
  onReset: () => void
}

const DOMAIN_RE = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/

function sanitizeDomain(raw: string): string {
  let d = raw.trim().toLowerCase()
  for (const prefix of ['https://', 'http://', 'www.']) {
    if (d.startsWith(prefix)) d = d.slice(prefix.length)
  }
  return d.split('/')[0]
}

export function DomainInput({ status, onSubmit, onReset }: Props) {
  const [value, setValue] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)

  const isRunning = status === 'running'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const domain = sanitizeDomain(value)
    if (!DOMAIN_RE.test(domain)) {
      setValidationError('Enter a valid domain — e.g. example.com')
      return
    }
    if (!accepted) {
      setValidationError('You must accept the terms before running a scan.')
      return
    }
    setValidationError(null)
    onSubmit(domain)
  }

  function handleReset() {
    setValue('')
    setValidationError(null)
    onReset()
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => { setValue(e.target.value); setValidationError(null) }}
              placeholder="Enter domain — e.g. example.com"
              disabled={isRunning}
              className="
                w-full pl-10 pr-4 py-3 rounded-xl
                bg-navy-800 border border-navy-700
                text-white placeholder-slate-600
                font-mono text-sm
                focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30
                disabled:opacity-50 disabled:cursor-not-allowed
                transition
              "
            />
          </div>

          {status === 'done' || status === 'error' ? (
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-3 rounded-xl bg-navy-800 border border-navy-700 text-slate-300 text-sm font-medium hover:border-cyan-500/50 hover:text-white transition"
            >
              Reset
            </button>
          ) : (
            <button
              type="submit"
              disabled={isRunning || !value.trim()}
              className="
                px-5 py-3 rounded-xl font-semibold text-sm
                bg-cyan-500 text-navy-950
                hover:bg-cyan-400
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200
                whitespace-nowrap
              "
            >
              {isRunning ? 'Scanning…' : 'Run Recon'}
            </button>
          )}
        </div>

        {/* Terms checkbox */}
        {status === 'idle' && (
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 accent-cyan-500 cursor-pointer"
            />
            <span className="text-xs text-slate-500 group-hover:text-slate-400 transition leading-relaxed">
              I confirm I own or have explicit written permission to scan this domain.
              This tool performs{' '}
              <strong className="text-slate-400">passive, read-only</strong> queries
              against public data sources only.
            </span>
          </label>
        )}

        {/* Validation error */}
        {validationError && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
            <AlertTriangle size={12} />
            {validationError}
          </p>
        )}
      </form>
    </div>
  )
}
