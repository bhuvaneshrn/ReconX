import { Network } from 'lucide-react'
import type { DNSData } from '../utils/types'

interface Props {
  data: DNSData
}

function RecordSection({ type, children }: { type: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h3 className="flex items-center gap-2 mb-3">
        <span className="badge tag-info">{type}</span>
      </h3>
      {children}
    </section>
  )
}

function RecordList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="font-mono text-sm text-slate-300 flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 flex-shrink-0 mt-1.5" />
          <span className="break-all">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function DNSTable({ data }: Props) {
  const hasAny =
    data.A.length || data.AAAA.length || data.MX.length ||
    data.NS.length || data.TXT.length || data.CNAME.length || data.SOA

  if (!hasAny) {
    return (
      <div className="card p-8 text-center">
        <Network size={32} className="text-slate-700 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No DNS records found.</p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {data.A.length > 0 && (
        <RecordSection type="A">
          <RecordList items={data.A} />
        </RecordSection>
      )}

      {data.AAAA.length > 0 && (
        <RecordSection type="AAAA">
          <RecordList items={data.AAAA} />
        </RecordSection>
      )}

      {data.NS.length > 0 && (
        <RecordSection type="NS">
          <RecordList items={data.NS} />
        </RecordSection>
      )}

      {data.MX.length > 0 && (
        <RecordSection type="MX">
          <ul className="space-y-1.5">
            {data.MX.map((mx, i) => (
              <li key={i} className="font-mono text-sm text-slate-300 flex items-center gap-2">
                <span className="text-xs text-slate-600 w-8 text-right">{mx.priority}</span>
                <span className="break-all">{mx.exchange}</span>
              </li>
            ))}
          </ul>
        </RecordSection>
      )}

      {data.CNAME.length > 0 && (
        <RecordSection type="CNAME">
          <RecordList items={data.CNAME} />
        </RecordSection>
      )}

      {data.TXT.length > 0 && (
        <div className="sm:col-span-2">
          <RecordSection type="TXT">
            <ul className="space-y-2">
              {data.TXT.map((txt, i) => (
                <li
                  key={i}
                  className="font-mono text-xs text-slate-400 bg-navy-800/60 rounded p-2.5 break-all"
                >
                  {txt}
                </li>
              ))}
            </ul>
          </RecordSection>
        </div>
      )}

      {data.SOA && (
        <div className="sm:col-span-2">
          <RecordSection type="SOA">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(data.SOA).map(([key, val]) => (
                <div key={key}>
                  <p className="text-xs text-slate-600 font-mono uppercase tracking-wider mb-0.5">{key}</p>
                  <p className="text-sm text-slate-300 font-mono break-all">{String(val)}</p>
                </div>
              ))}
            </div>
          </RecordSection>
        </div>
      )}
    </div>
  )
}
