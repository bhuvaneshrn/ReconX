import { useState } from 'react'
import { Search, Globe, List, GitBranch } from 'lucide-react'
import type { SubdomainEntry } from '../utils/types'
import { SubdomainTree } from './SubdomainTree'

interface Props {
  subdomains: SubdomainEntry[]
  domain?: string
}

type ViewMode = 'list' | 'tree'

export function SubdomainList({ subdomains, domain = '' }: Props) {
  const [filter, setFilter] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const filtered = subdomains.filter((s) =>
    s.subdomain.toLowerCase().includes(filter.toLowerCase())
  )

  if (subdomains.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Globe size={32} className="text-slate-700 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No subdomains found in certificate transparency logs.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats + controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-mono font-bold text-white">{subdomains.length}</span>
          <span className="text-sm text-slate-500">subdomains found</span>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 p-1 bg-navy-900 border border-navy-700 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${viewMode === 'list'
                ? 'bg-navy-700 text-white'
                : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            <List size={12} className={viewMode === 'list' ? 'text-cyan-400' : ''} />
            List
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${viewMode === 'tree'
                ? 'bg-navy-700 text-white'
                : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            <GitBranch size={12} className={viewMode === 'tree' ? 'text-cyan-400' : ''} />
            Tree
          </button>
        </div>

        {/* Filter — only shown in list mode */}
        {viewMode === 'list' && (
          <div className="flex-1 min-w-48 relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter subdomains…"
              className="
                w-full pl-8 pr-3 py-2 text-sm
                bg-navy-800 border border-navy-700 rounded-lg
                text-white placeholder-slate-600 font-mono
                focus:outline-none focus:border-cyan-500/60
                transition
              "
            />
          </div>
        )}
      </div>

      {/* Tree view */}
      {viewMode === 'tree' && (
        <SubdomainTree domain={domain} subdomains={subdomains} />
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-800">
                  <th className="text-left text-xs font-mono text-slate-600 uppercase tracking-wider px-4 py-3">
                    Subdomain
                  </th>
                  <th className="text-left text-xs font-mono text-slate-600 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                    Logged At
                  </th>
                  <th className="text-left text-xs font-mono text-slate-600 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                    Issuer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {filtered.slice(0, 100).map((entry) => (
                  <tr key={entry.subdomain} className="hover:bg-navy-800/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-cyan-400 text-xs break-all">
                      {entry.subdomain}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs font-mono hidden md:table-cell whitespace-nowrap">
                      {entry.logged_at
                        ? new Date(entry.logged_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 text-xs hidden lg:table-cell max-w-xs truncate">
                      {entry.issuer || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 100 && (
            <div className="px-4 py-3 border-t border-navy-800 text-xs text-slate-600 font-mono">
              Showing 100 of {filtered.length} results. Use the filter to narrow down.
            </div>
          )}
        </div>
      )}
    </div>
  )
}