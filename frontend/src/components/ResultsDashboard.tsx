import { useState } from 'react'
import { Globe, Network, Layers, Sparkles, Clock, AlertTriangle, Shield, Radio } from 'lucide-react'
import { WhoisCard } from './WhoisCard'
import { DNSTable } from './DNSTable'
import { SubdomainList } from './SubdomainList'
import { AISummaryPanel } from './AISummaryPanel'
import HeadersCard from './HeadersCard'
import ShodanCard from './ShodanCard'
import type { ReconResult, TabId } from '../utils/types'

interface Props {
  result: ReconResult
}

const TABS: { id: TabId; label: string; icon: React.ReactNode; badge?: (r: ReconResult) => string | number | null }[] = [
  { id: 'whois', label: 'WHOIS', icon: <Globe size={14} /> },
  {
    id: 'dns', label: 'DNS', icon: <Network size={14} />, badge: (r) => {
      if (!r.dns) return null
      const count = r.dns.A.length + r.dns.MX.length + r.dns.NS.length + r.dns.TXT.length + r.dns.CNAME.length + r.dns.AAAA.length
      return count || null
    }
  },
  { id: 'subdomains', label: 'Subdomains', icon: <Layers size={14} />, badge: (r) => r.subdomains.length || null },
  {
    id: 'headers', label: 'Headers', icon: <Shield size={14} />, badge: (r) => {
      if (!r.headers) return null
      const missing = r.headers.missing_security_headers?.length
      return missing ? `${missing} missing` : null
    }
  },
  {
    id: 'shodan', label: 'Shodan', icon: <Radio size={14} />, badge: (r) => {
      if (!r.shodan) return null
      if (r.shodan.vulns?.length) return `${r.shodan.vulns.length} CVEs`
      return r.shodan.ports?.length || null
    }
  },
  { id: 'ai', label: 'AI Summary', icon: <Sparkles size={14} /> },
]

export function ResultsDashboard({ result }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('whois')

  return (
    <div className="w-full space-y-5">
      {/* Meta bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-mono font-semibold text-white">
            {result.domain}
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Passive recon complete
          </p>
        </div>
        <div className="flex items-center gap-4">
          {result.duration_ms && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <Clock size={12} />
              {(result.duration_ms / 1000).toFixed(1)}s
            </span>
          )}
          {Object.keys(result.errors).length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-amber-500 font-mono">
              <AlertTriangle size={12} />
              {Object.keys(result.errors).length} module error(s)
            </span>
          )}
        </div>
      </div>

      {/* Module errors */}
      {Object.entries(result.errors).length > 0 && (
        <div className="rounded-lg border border-amber-800/30 bg-amber-900/10 px-4 py-3 space-y-1">
          {Object.entries(result.errors).map(([mod, err]) => (
            <p key={mod} className="text-xs font-mono text-amber-400">
              <span className="text-amber-600">{mod}:</span> {err}
            </p>
          ))}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 p-1 bg-navy-900 border border-navy-700 rounded-xl w-fit">
        {TABS.map((tab) => {
          const badge = tab.badge?.(result)
          const active = activeTab === tab.id

          // Badge color — red for CVEs/missing, cyan otherwise
          const isCriticalBadge =
            typeof badge === 'string' && (badge.includes('CVE') || badge.includes('missing'))

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-navy-700 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-navy-800/50'
                }
              `}
            >
              <span className={active ? 'text-cyan-400' : ''}>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {badge != null && (
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${active
                    ? isCriticalBadge
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-navy-700 text-slate-500'
                  }`}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'whois' && (
          result.whois
            ? <WhoisCard data={result.whois} />
            : <EmptyModule name="WHOIS" error={result.errors.whois} />
        )}
        {activeTab === 'dns' && (
          result.dns
            ? <DNSTable data={result.dns} />
            : <EmptyModule name="DNS" error={result.errors.dns} />
        )}
        {activeTab === 'subdomains' && (
          <SubdomainList subdomains={result.subdomains} />
        )}
        {activeTab === 'headers' && (
          result.headers
            ? <HeadersCard data={result.headers} error={result.errors.headers} />
            : <EmptyModule name="HTTP Headers" error={result.errors.headers} />
        )}
        {activeTab === 'shodan' && (
          result.shodan
            ? <ShodanCard data={result.shodan} error={result.errors.shodan} />
            : <EmptyModule name="Shodan" error={result.errors.shodan} />
        )}
        {activeTab === 'ai' && (
          result.ai_summary
            ? <AISummaryPanel data={result.ai_summary} />
            : <EmptyModule name="AI Summary" error={result.errors.ai_summary} />
        )}
      </div>
    </div>
  )
}

function EmptyModule({ name, error }: { name: string; error?: string }) {
  return (
    <div className="card p-8 text-center">
      <AlertTriangle size={28} className="text-slate-700 mx-auto mb-3" />
      <p className="text-slate-400 text-sm font-medium">{name} data unavailable</p>
      {error && <p className="text-xs text-slate-600 font-mono mt-1">{error}</p>}
    </div>
  )
}