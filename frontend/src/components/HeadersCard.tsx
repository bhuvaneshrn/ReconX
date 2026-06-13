import { HeadersData } from '../utils/types'

interface Props {
    data: HeadersData | null
    error?: string
}

const HEADER_LABELS: Record<string, string> = {
    'strict-transport-security': 'HSTS',
    'content-security-policy': 'CSP',
    'x-frame-options': 'X-Frame-Options',
    'x-content-type-options': 'X-Content-Type-Options',
    'referrer-policy': 'Referrer-Policy',
    'permissions-policy': 'Permissions-Policy',
    'x-xss-protection': 'XSS Protection',
}

export default function HeadersCard({ data, error }: Props) {
    if (error) {
        return (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
                Headers error: {error}
            </div>
        )
    }

    if (!data) {
        return (
            <div className="text-gray-500 text-sm">No header data available.</div>
        )
    }

    if (data.error) {
        return (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-400 text-sm">
                {data.error}
            </div>
        )
    }

    const presentCount = Object.keys(data.security_headers_present).length
    const missingCount = data.missing_security_headers.length
    const totalSecurity = presentCount + missingCount
    const score = totalSecurity > 0 ? Math.round((presentCount / totalSecurity) * 100) : 0

    const scoreColor =
        score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'

    return (
        <div className="space-y-6">
            {/* Overview row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="Status Code" value={String(data.status_code ?? '—')} />
                <Stat label="Server" value={data.server ?? '—'} />
                <Stat label="Powered By" value={data.x_powered_by ?? '—'} />
                <div className="rounded-lg bg-gray-800/60 p-3">
                    <p className="text-xs text-gray-500 mb-1">Security Score</p>
                    <p className={`text-xl font-bold font-mono ${scoreColor}`}>{score}%</p>
                    <p className="text-xs text-gray-500 mt-1">{presentCount}/{totalSecurity} headers</p>
                </div>
            </div>

            {/* Tech hints */}
            {data.tech_hints.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Detected Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.tech_hints.map((hint) => (
                            <span
                                key={hint}
                                className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono"
                            >
                                {hint}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Security headers */}
            <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Security Headers
                </h3>
                <div className="space-y-2">
                    {/* Present */}
                    {Object.entries(data.security_headers_present).map(([key, val]) => (
                        <div
                            key={key}
                            className="flex items-start gap-3 rounded-lg bg-green-500/5 border border-green-500/20 px-3 py-2"
                        >
                            <span className="text-green-400 mt-0.5 text-sm">✓</span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-green-400">
                                    {HEADER_LABELS[key] ?? key}
                                </p>
                                <p className="text-xs text-gray-500 font-mono truncate" title={val}>
                                    {val}
                                </p>
                            </div>
                        </div>
                    ))}
                    {/* Missing */}
                    {data.missing_security_headers.map((key) => (
                        <div
                            key={key}
                            className="flex items-center gap-3 rounded-lg bg-red-500/5 border border-red-500/20 px-3 py-2"
                        >
                            <span className="text-red-400 text-sm">✗</span>
                            <p className="text-sm text-red-400">{HEADER_LABELS[key] ?? key}</p>
                            <span className="ml-auto text-xs text-gray-600">missing</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Raw headers toggle */}
            <details className="group">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-300 select-none">
                    View all raw headers ({Object.keys(data.raw_headers).length})
                </summary>
                <div className="mt-2 rounded-lg bg-gray-900 border border-gray-700 p-3 font-mono text-xs text-gray-400 space-y-1 max-h-64 overflow-y-auto">
                    {Object.entries(data.raw_headers).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                            <span className="text-cyan-600 shrink-0">{k}:</span>
                            <span className="text-gray-400 break-all">{v}</span>
                        </div>
                    ))}
                </div>
            </details>
        </div>
    )
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-gray-800/60 p-3">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-sm font-mono text-gray-200 truncate" title={value}>{value}</p>
        </div>
    )
}