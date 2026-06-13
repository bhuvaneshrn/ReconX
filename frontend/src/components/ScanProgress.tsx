import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

const STEPS = [
  { label: 'WHOIS lookup', duration: 3000 },
  { label: 'DNS enumeration', duration: 2000 },
  { label: 'Subdomain discovery via crt.sh', duration: 8000 },
  { label: 'Generating AI risk summary', duration: 5000 },
]

interface Props {
  domain: string
}

export function ScanProgress({ domain }: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsed((p) => p + 100), 100)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let total = 0
    for (let i = 0; i < STEPS.length; i++) {
      total += STEPS[i].duration
      if (elapsed < total) {
        setStepIndex(i)
        break
      }
      if (i === STEPS.length - 1) setStepIndex(i)
    }
  }, [elapsed])

  const totalDuration = STEPS.reduce((s, t) => s + t.duration, 0)
  const progress = Math.min((elapsed / totalDuration) * 100, 95) // cap at 95 until done

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Domain banner */}
      <div className="text-center">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-1">
          Scanning
        </p>
        <p className="text-lg font-mono font-semibold text-cyan-400">{domain}</p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 font-mono">
          <span>{Math.round(progress)}%</span>
          <span>{(elapsed / 1000).toFixed(1)}s</span>
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-2">
        {STEPS.map((step, i) => {
          const done = i < stepIndex
          const active = i === stepIndex
          return (
            <div
              key={step.label}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-300 ${
                active
                  ? 'border-cyan-500/40 bg-cyan-500/5'
                  : done
                  ? 'border-navy-700 bg-navy-900/50 opacity-50'
                  : 'border-navy-800 bg-transparent opacity-30'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                {done ? (
                  <span className="text-green-400 text-xs">✓</span>
                ) : active ? (
                  <Loader2 size={13} className="text-cyan-400 animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-navy-600 block" />
                )}
              </div>
              <span
                className={`text-sm font-mono ${
                  active ? 'text-white' : done ? 'text-slate-500' : 'text-slate-700'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
