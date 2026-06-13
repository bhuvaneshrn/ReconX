import { Calendar, Globe, Server, Shield, Mail } from 'lucide-react'
import type { WhoisData } from '../utils/types'

interface Props {
  data: WhoisData
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-navy-800 last:border-0">
      <span className="text-xs text-slate-500 font-mono uppercase tracking-wider w-40 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-slate-200 font-mono break-all">{value}</span>
    </div>
  )
}

function formatDate(iso: string | null) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return iso
  }
}

export function WhoisCard({ data }: Props) {
  return (
    <div className="space-y-6">
      {/* Registration info */}
      <section className="card p-5">
        <h3 className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">
          <Globe size={13} />
          Registration
        </h3>
        <div className="divide-y divide-navy-800">
          <Row label="Domain" value={data.domain_name} />
          <Row label="Registrar" value={data.registrar} />
          <Row label="Registrant Org" value={data.registrant_org} />
          <Row label="Country" value={data.registrant_country} />
          <Row label="DNSSEC" value={data.dnssec} />
        </div>
      </section>

      {/* Dates */}
      <section className="card p-5">
        <h3 className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">
          <Calendar size={13} />
          Important Dates
        </h3>
        <div className="divide-y divide-navy-800">
          <Row label="Created" value={formatDate(data.creation_date)} />
          <Row label="Expires" value={formatDate(data.expiration_date)} />
          <Row label="Updated" value={formatDate(data.updated_date)} />
        </div>
      </section>

      {/* Name servers */}
      {data.name_servers && data.name_servers.length > 0 && (
        <section className="card p-5">
          <h3 className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">
            <Server size={13} />
            Name Servers
          </h3>
          <ul className="space-y-1.5">
            {data.name_servers.map((ns) => (
              <li key={ns} className="font-mono text-sm text-slate-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 flex-shrink-0" />
                {ns.toLowerCase()}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Status + emails */}
      <div className="grid sm:grid-cols-2 gap-4">
        {data.status && data.status.length > 0 && (
          <section className="card p-5">
            <h3 className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">
              <Shield size={13} />
              Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.status.map((s) => (
                <span key={s} className="badge tag-info text-xs">
                  {s.split(' ')[0]}
                </span>
              ))}
            </div>
          </section>
        )}

        {data.emails && data.emails.length > 0 && (
          <section className="card p-5">
            <h3 className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">
              <Mail size={13} />
              Emails
            </h3>
            <ul className="space-y-1">
              {data.emails.map((e) => (
                <li key={e} className="font-mono text-xs text-slate-400 break-all">{e}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
