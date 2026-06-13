import { ShodanData } from '../utils/types'

interface Props {
    data: ShodanData | null
    error?: string
}

const PORT_COLORS: Record<number, string> = {
    80: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    443: 'border-green-500/30 text-green-400 bg-green-500/10',
    22: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10',
    21: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
    3306: 'border-red-500/30 text-red-400 bg-red-500/10',
    5432: 'border-red-500/30 text-red-400 bg-red-500/10',
    6379: 'border-red-500/30 text-red-400 bg-red-500/10',
    27017: 'border-red-500/30 text-red-400 bg-red-500/10',
}

function portClass(port: number) {
    return PORT_COLORS[port] ?? 'border-gray-600/30 text-gray-400 bg-gray-700/20'
}

export default function ShodanCard({ data, error }: Props) {
    if (error) {
        return (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
                Shodan error: {error}
            </div>
        )
    }

    if (!data) {
        return <div className="text-gray-500 text-sm">No Shodan data available.</div>
    }

    if (data.error) {
        return (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-400 text-sm">
                {data.error}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* IP Overview */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Stat label="IP Address" value={data.ip ?? '—'} mono />
                <Stat label="Organization" value={data.org ?? '—'} />
                <Stat label="ISP" value={data.isp ?? '—'} />
                <Stat label="Country" value={data.country ?? '—'} />
                <Stat label="City" value={data.city ?? '—'} />
                <Stat label="OS" value={data.os ?? 'Unknown'} />
            </div>

            {/* Last seen */}
            {data.last_update && (
                <p className="text-xs text-gray-500">
                    Last scanned by Shodan: <span className="text-gray-400">{data.last_update}</span>
                </p>
            )}

            {/* Hostnames */}
            {data.hostnames.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Hostnames
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.hostnames.map((h) => (
                            <span key={h} className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-300 text-xs font-mono">
                                {h}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Open Ports */}
            {data.ports.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Open Ports ({data.ports.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.ports.map((port) => (
                            <span
                                key={port}
                                className={`px-2 py-1 rounded border text-xs font-mono font-semibold ${portClass(port)}`}
                            >
                                {port}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Services */}
            {data.services.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Services
                    </h3>
                    <div className="space-y-2">
                        {data.services.map((svc, i) => (
                            <div
                                key={i}
                                className="rounded-lg bg-gray-800/60 border border-gray-700/50 px-3 py-2 flex flex-wrap items-center gap-3"
                            >
                                <span className={`px-2 py-0.5 rounded border text-xs font-mono font-bold ${portClass(svc.port ?? 0)}`}>
                                    {svc.port}/{svc.transport ?? 'tcp'}
                                </span>
                                {svc.product && (
                                    <span className="text-sm text-gray-300">
                                        {svc.product}
                                        {svc.version && (
                                            <span className="text-gray-500 ml-1">v{svc.version}</span>
                                        )}
                                    </span>
                                )}
                                {svc.banner && (
                                    <span className="text-xs text-gray-600 font-mono truncate max-w-xs" title={svc.banner}>
                                        {svc.banner}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Vulnerabilities */}
            {data.vulns.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
                        ⚠ Known Vulnerabilities ({data.vulns.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.vulns.map((cve) => (
                            <a
                                key={cve}
                                href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono hover:bg-red-500/20 transition-colors"
                            >
                                {cve}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Tags */}
            {data.tags.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="rounded-lg bg-gray-800/60 p-3">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-sm text-gray-200 truncate ${mono ? 'font-mono' : ''}`} title={value}>
                {value}
            </p>
        </div>
    )
}