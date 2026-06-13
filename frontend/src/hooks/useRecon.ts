import { useState, useCallback } from 'react'
import { runRecon, saveScan } from '../utils/api'
import type { ReconResult, ReconStatus } from '../utils/types'

export function useRecon() {
  const [status, setStatus] = useState<ReconStatus>('idle')
  const [result, setResult] = useState<ReconResult | null>(null)
  const [scanId, setScanId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (domain: string) => {
    setStatus('running')
    setResult(null)
    setScanId(null)
    setError(null)

    try {
      const data = await runRecon(domain)
      setResult(data)
      setStatus('done')

      // Save to history
      try {
        const saved = await saveScan(data)
        setScanId(saved.id)
      } catch {
        // Non-critical — scan still displayed
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } }; message?: string })
          ?.response?.data?.detail ??
        (err as { message?: string })?.message ??
        'Unknown error'
      setError(msg)
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setScanId(null)
    setError(null)
  }, [])

  return { status, result, scanId, error, execute, reset }
}