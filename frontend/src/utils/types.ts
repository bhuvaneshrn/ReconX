export interface WhoisData {
  domain_name: string | null
  registrar: string | null
  creation_date: string | null
  expiration_date: string | null
  updated_date: string | null
  name_servers: string[]
  status: string[]
  registrant_org: string | null
  registrant_country: string | null
  emails: string[]
  dnssec: string | null
}

export interface MXRecord {
  priority: number
  exchange: string
}

export interface SOARecord {
  mname: string
  rname: string
  serial: number
  refresh: number
  retry: number
  expire: number
  minimum: number
}

export interface DNSData {
  A: string[]
  AAAA: string[]
  MX: MXRecord[]
  NS: string[]
  TXT: string[]
  CNAME: string[]
  SOA: SOARecord | null
}

export interface SubdomainEntry {
  subdomain: string
  issuer: string | null
  logged_at: string | null
  not_before: string | null
  not_after: string | null
}

export interface KeyFinding {
  severity: 'info' | 'low' | 'medium' | 'high'
  finding: string
}

export interface AISummary {
  overall_risk: 'Low' | 'Medium' | 'High' | 'Critical' | 'Unknown'
  key_findings: KeyFinding[]
  recommendations: string[]
  plain_summary: string
  error?: string | null
}

export interface HeadersData {
  status_code: number | null
  server: string | null
  content_type: string | null
  x_powered_by: string | null
  security_headers_present: Record<string, string>
  missing_security_headers: string[]
  tech_hints: string[]
  raw_headers: Record<string, string>
  error?: string | null
}

export interface ShodanService {
  port: number | null
  transport: string | null
  product: string | null
  version: string | null
  cpe: string[]
  banner: string | null
}

export interface ShodanData {
  ip: string | null
  org: string | null
  isp: string | null
  country: string | null
  city: string | null
  os: string | null
  ports: number[]
  services: ShodanService[]
  vulns: string[]
  last_update: string | null
  hostnames: string[]
  tags: string[]
  error?: string | null
}

export interface ReconResult {
  domain: string
  whois: WhoisData | null
  dns: DNSData | null
  subdomains: SubdomainEntry[]
  headers: HeadersData | null
  shodan: ShodanData | null
  ai_summary: AISummary | null
  errors: Record<string, string>
  duration_ms: number | null
}

export type TabId = 'whois' | 'dns' | 'subdomains' | 'headers' | 'shodan' | 'ai'

export type ReconStatus = 'idle' | 'running' | 'done' | 'error'