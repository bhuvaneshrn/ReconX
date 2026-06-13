import whois
from app.models.schemas import WhoisData
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def normalize_date(val) -> Optional[str]:
    if val is None:
        return None
    if isinstance(val, list):
        val = val[0]
    try:
        return val.isoformat()
    except Exception:
        return str(val)


def normalize_list(val) -> list:
    if val is None:
        return []
    if isinstance(val, list):
        return [str(v) for v in val if v]
    return [str(val)]


async def run_whois(domain: str) -> WhoisData:
    try:
        w = whois.whois(domain)
        return WhoisData(
            domain_name=str(w.domain_name[0]) if isinstance(w.domain_name, list) else str(w.domain_name or ""),
            registrar=str(w.registrar or ""),
            creation_date=normalize_date(w.creation_date),
            expiration_date=normalize_date(w.expiration_date),
            updated_date=normalize_date(w.updated_date),
            name_servers=normalize_list(w.name_servers),
            status=normalize_list(w.status),
            registrant_org=str(w.org or ""),
            registrant_country=str(w.country or ""),
            emails=normalize_list(w.emails),
            dnssec=str(w.dnssec or ""),
        )
    except Exception as e:
        logger.error(f"WHOIS error for {domain}: {e}")
        raise
