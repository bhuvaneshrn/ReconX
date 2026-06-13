import { useEffect, useState, useCallback } from 'react'
import { Clock, Search, Trash2, Download, ExternalLink, AlertTriangle } from 'lucide-react'
import { fetchHistory, deleteScan, getExportUrl, type ScanSummary } from '../utils/api'

const RISK_COLORS: Record<string, string> = {
    Low: 'bg-green-500/10 text-green-400 border-green-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    High: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    Unknown: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

interface Props {
    onLoadScan: (domain: string) => void
}

export function HistoryPage({ onLoadScan }: Props) {
    const [scans, setScans] = useState<ScanSummary[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const load = useCallback(async (q?: string) => {
        setLoading(true)
        try {
            const data = await fetchHistory(50, q)
            setScans(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        load(search.trim() || undefined)
    }

    const handleDelete = async (id: number) => {
        setDeletingId(id)
        try {
            await deleteScan(id)
            setScans((prev) => prev.filter((s) => s.id !== id))
        } finally {
            setDeletingId(null)
        }
    }

    const handleExport = async (id: number, format: 'json' | 'txt') => {
        try {
            const response = await fetch(getExportUrl(id, format))
            if (!response.ok) throw new Error('Export failed')
            const blob = await response.blob()
            const objectUrl = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = objectUrl
            a.download = `reconx_scan_${id}.${format}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(objectUrl)
        } catch (err) {
            console.error('Export error:', err)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-lg font-mono font-semibold text-white">Scan History</h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Past passive recon results</p>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search domain..."
                            className="pl-8 pr-3 py-2 rounded-lg bg-navy-800 border border-navy-600 text-sm text-white placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-500/50 w-52"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono hover:bg-cyan-500/20 transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="text-center py-16 text-slate-600 font-mono text-sm">Loading...</div>
            ) : scans.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                    <AlertTriangle size={28} className="text-slate-700 mx-auto" />
                    <p className="text-slate-500 text-sm font-mono">No scans found</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {scans.map((scan) => (
                        <div
                            key={scan.id}
                            className="flex items-center gap-4 px-4 py-3 rounded-lg bg-navy-800/60 border border-navy-700/50 hover:border-navy-600 transition-colors group"
                        >
                            {/* Domain */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-mono text-white truncate">{scan.domain}</p>
                                <p className="text-xs text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                                    <Clock size={10} />
                                    {new Date(scan.scanned_at).toLocaleString()}
                                    {scan.duration_ms && (
                                        <span className="ml-2 text-slate-700">
                                            {(scan.duration_ms / 1000).toFixed(1)}s
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Risk badge */}
                            {scan.risk_level && (
                                <span className={`px-2 py-0.5 rounded border text-xs font-mono font-semibold shrink-0 ${RISK_COLORS[scan.risk_level] ?? RISK_COLORS.Unknown}`}>
                                    {scan.risk_level}
                                </span>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onLoadScan(scan.domain)}
                                    title="Re-scan"
                                    className="p-1.5 rounded hover:bg-navy-700 text-slate-500 hover:text-cyan-400 transition-colors"
                                >
                                    <ExternalLink size={13} />
                                </button>
                                <button
                                    onClick={() => handleExport(scan.id, 'json')}
                                    title="Export JSON"
                                    className="p-1.5 rounded hover:bg-navy-700 text-slate-500 hover:text-cyan-400 transition-colors"
                                >
                                    <Download size={13} />
                                </button>
                                <button
                                    onClick={() => handleExport(scan.id, 'txt')}
                                    title="Export TXT"
                                    className="p-1.5 rounded hover:bg-navy-700 text-slate-500 hover:text-cyan-400 transition-colors font-mono text-xs"
                                >
                                    TXT
                                </button>
                                <button
                                    onClick={() => handleDelete(scan.id)}
                                    disabled={deletingId === scan.id}
                                    title="Delete"
                                    className="p-1.5 rounded hover:bg-navy-700 text-slate-600 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}