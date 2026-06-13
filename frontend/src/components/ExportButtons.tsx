import { Download, FileJson, FileText } from 'lucide-react'
import { getExportUrl } from '../utils/api'

interface Props {
    scanId: number | null
}

export function ExportButtons({ scanId }: Props) {
    if (!scanId) return null

    const handleExport = async (format: 'json' | 'txt') => {
        const url = getExportUrl(scanId, format)
        try {
            const response = await fetch(url)
            if (!response.ok) throw new Error('Export failed')
            const blob = await response.blob()
            const objectUrl = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = objectUrl
            a.download = `reconx_scan_${scanId}.${format}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(objectUrl)
        } catch (err) {
            console.error('Export error:', err)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                <Download size={11} />
                Export:
            </span>
            <button
                onClick={() => handleExport('json')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-navy-600 bg-navy-800/50 text-xs font-mono text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
            >
                <FileJson size={12} />
                JSON
            </button>
            <button
                onClick={() => handleExport('txt')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-navy-600 bg-navy-800/50 text-xs font-mono text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
            >
                <FileText size={12} />
                TXT
            </button>
        </div>
    )
}