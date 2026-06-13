from pydantic import BaseModel
from typing import Optional, List, Any, Dict


class ReconRequest(BaseModel):
    domain: str


class WhoisData(BaseModel):
    domain_name: Optional[str] = None
    registrar: Optional[str] = None
    creation_date: Optional[str] = None
    expiration_date: Optional[str] = None
    updated_date: Optional[str] = None
    name_servers: Optional[List[str]] = []
    status: Optional[List[str]] = []
    registrant_org: Optional[str] = None
    registrant_country: Optional[str] = None
    emails: Optional[List[str]] = []
    dnssec: Optional[str] = None


class DNSRecord(BaseModel):
    type: str
    value: str
    ttl: Optional[int] = None


class DNSData(BaseModel):
    A: List[str] = []
    AAAA: List[str] = []
    MX: List[dict] = []
    NS: List[str] = []
    TXT: List[str] = []
    CNAME: List[str] = []
    SOA: Optional[dict] = None


class SubdomainEntry(BaseModel):
    subdomain: str
    issuer: Optional[str] = None
    logged_at: Optional[str] = None
    not_before: Optional[str] = None
    not_after: Optional[str] = None


class AISummary(BaseModel):
    overall_risk: str = "Unknown"
    key_findings: List[dict] = []
    recommendations: List[str] = []
    plain_summary: str = ""
    error: Optional[str] = None


class HeadersData(BaseModel):
    status_code: Optional[int] = None
    server: Optional[str] = None
    content_type: Optional[str] = None
    x_powered_by: Optional[str] = None
    security_headers_present: Dict[str, str] = {}
    missing_security_headers: List[str] = []
    tech_hints: List[str] = []
    raw_headers: Dict[str, str] = {}
    error: Optional[str] = None


class ShodanHost(BaseModel):
    port: Optional[int] = None
    transport: Optional[str] = None
    product: Optional[str] = None
    version: Optional[str] = None
    cpe: List[str] = []
    banner: Optional[str] = None


class ShodanData(BaseModel):
    ip: Optional[str] = None
    org: Optional[str] = None
    isp: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    os: Optional[str] = None
    ports: List[int] = []
    services: List[dict] = []
    vulns: List[str] = []
    last_update: Optional[str] = None
    hostnames: List[str] = []
    tags: List[str] = []
    error: Optional[str] = None


class ReconResult(BaseModel):
    domain: str
    whois: Optional[WhoisData] = None
    dns: Optional[DNSData] = None
    subdomains: List[SubdomainEntry] = []
    headers: Optional[HeadersData] = None
    shodan: Optional[ShodanData] = None
    ai_summary: Optional[AISummary] = None
    errors: dict = {}
    duration_ms: Optional[int] = None