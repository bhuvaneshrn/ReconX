import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { DomainInput } from './components/DomainInput'
import { ScanProgress } from './components/ScanProgress'
import { ResultsDashboard } from './components/ResultsDashboard'
import { HistoryPage } from './components/HistoryPage'
import { ExportButtons } from './components/ExportButtons'
import { AuthPage } from './components/AuthPage'
import { useRecon } from './hooks/useRecon'
import { useAuth } from './hooks/useAuth'
import { Shield, Zap, Globe, Sparkles, History, Loader2 } from 'lucide-react'

const FEATURES = [
  { icon: <Globe size={16} />, label: 'WHOIS & DNS', desc: 'Full registration and record lookup' },
  { icon: <Zap size={16} />, label: 'Subdomains', desc: 'Certificate transparency log search' },
  { icon: <Shield size={16} />, label: 'Passive Only', desc: 'No packets sent to target servers' },
  { icon: <Sparkles size={16} />, label: 'AI Risk Summary', desc: 'Groq-powered threat analysis' },
]

type View = 'home' | 'history'

export default function App() {
  const { user, loading } = useAuth()
  const { status, result, scanId, error, execute, reset } = useRecon()
  const [view, setView] = useState<View>('home')

  // Loading auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <Loader2 size={24} className="text-cyan-400 animate-spin" />
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return <AuthPage />
  }

  const handleLoadFromHistory = (domain: string) => {
    setView('home')
    execute(domain)
  }

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <Navbar />

      {/* View toggle */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex gap-1 p-1 bg-navy-900 border border-navy-700 rounded-xl w-fit">
          <button
            onClick={() => setView('home')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'home' ? 'bg-navy-700 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            <Globe size={14} className={view === 'home' ? 'text-cyan-400' : ''} />
            Scanner
          </button>
          <button
            onClick={() => setView('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'history' ? 'bg-navy-700 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            <History size={14} className={view === 'history' ? 'text-cyan-400' : ''} />
            History
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-12">
        {view === 'history' ? (
          <HistoryPage onLoadScan={handleLoadFromHistory} />
        ) : (
          <>
            {/* Hero */}
            <section className="scan-grid rounded-2xl border border-navy-700 px-8 py-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
              <div className="relative space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-xs font-mono text-cyan-400 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Passive Recon Only
                </div>
                <h1 className="text-4xl sm:text-5xl font-mono font-bold tracking-tight">
                  Recon<span className="text-cyan-400">X</span>
                </h1>
                <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
                  Automated OSINT reconnaissance. Enter a domain to aggregate WHOIS, DNS,
                  subdomains, HTTP headers, Shodan data, and AI risk analysis — all from public sources.
                </p>
                <div className="pt-2">
                  {status === 'running' && result === null ? (
                    <ScanProgress domain="" />
                  ) : (
                    <DomainInput status={status} onSubmit={execute} onReset={reset} />
                  )}
                </div>
                {status === 'error' && error && (
                  <div className="max-w-lg mx-auto text-sm text-red-400 font-mono bg-red-900/10 border border-red-800/30 rounded-lg px-4 py-3">
                    {error}
                  </div>
                )}
              </div>
            </section>

            {status === 'running' && (
              <section className="flex justify-center">
                <ScanProgress domain="" />
              </section>
            )}

            {result && (
              <section className="space-y-4">
                <div className="flex justify-end">
                  <ExportButtons scanId={scanId} />
                </div>
                <ResultsDashboard result={result} />
              </section>
            )}

            {status === 'idle' && (
              <section>
                <p className="text-xs font-mono uppercase tracking-widest text-slate-600 text-center mb-6">
                  What ReconX collects
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {FEATURES.map((f) => (
                    <div key={f.label} className="card p-5 space-y-2.5 hover:border-navy-600 transition-colors">
                      <span className="text-cyan-400">{f.icon}</span>
                      <p className="text-sm font-semibold text-white">{f.label}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <footer className="text-center space-y-2 pb-4">
              <p className="text-xs text-slate-700 font-mono">
                ReconX performs passive, read-only queries against public data sources only.
              </p>
              <p className="text-xs text-slate-800 font-mono">For authorized use only.</p>
            </footer>
          </>
        )}
      </main>
    </div>
  )
}