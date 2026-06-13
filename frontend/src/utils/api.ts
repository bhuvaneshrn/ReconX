import axios from 'axios'
import type { ReconResult } from './types'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 90000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('reconx_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('reconx_token')
      window.location.reload()
    }
    return Promise.reject(err)
  }
)

export async function runRecon(domain: string): Promise<ReconResult> {
  const { data } = await api.post<ReconResult>('/recon', { domain })
  return data
}

export interface ScanSummary {
  id: number
  domain: string
  scanned_at: string
  duration_ms: number | null
  risk_level: string | null
}

export async function fetchHistory(limit = 20, search?: string): Promise<ScanSummary[]> {
  const params: Record<string, string | number> = { limit }
  if (search) params.search = search
  const { data } = await api.get<ScanSummary[]>('/history', { params })
  return data
}

export async function saveScan(result: ReconResult): Promise<{ id: number }> {
  const { data } = await api.post('/history/save', result)
  return data
}

export async function fetchScanById(id: number): Promise<{ id: number; domain: string; scanned_at: string; result: ReconResult }> {
  const { data } = await api.get(`/history/${id}`)
  return data
}

export async function deleteScan(id: number): Promise<void> {
  await api.delete(`/history/${id}`)
}

export function getExportUrl(id: number, format: 'json' | 'txt'): string {
  return `${API_BASE}/export/${id}/${format}`
}

export { api }