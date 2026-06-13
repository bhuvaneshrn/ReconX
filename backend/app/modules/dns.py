import dns.resolver
import dns.exception
from app.models.schemas import DNSData
import logging

logger = logging.getLogger(__name__)

RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"]


async def run_dns(domain: str) -> DNSData:
    result = DNSData()
    resolver = dns.resolver.Resolver()
    resolver.timeout = 5
    resolver.lifetime = 10

    for rtype in RECORD_TYPES:
        try:
            answers = resolver.resolve(domain, rtype)
            if rtype == "A":
                result.A = [str(r.address) for r in answers]
            elif rtype == "AAAA":
                result.AAAA = [str(r.address) for r in answers]
            elif rtype == "MX":
                result.MX = [
                    {"priority": r.preference, "exchange": str(r.exchange).rstrip(".")}
                    for r in answers
                ]
            elif rtype == "NS":
                result.NS = [str(r.target).rstrip(".") for r in answers]
            elif rtype == "TXT":
                result.TXT = [b"".join(r.strings).decode("utf-8", errors="replace") for r in answers]
            elif rtype == "CNAME":
                result.CNAME = [str(r.target).rstrip(".") for r in answers]
            elif rtype == "SOA":
                r = answers[0]
                result.SOA = {
                    "mname": str(r.mname).rstrip("."),
                    "rname": str(r.rname).rstrip("."),
                    "serial": r.serial,
                    "refresh": r.refresh,
                    "retry": r.retry,
                    "expire": r.expire,
                    "minimum": r.minimum,
                }
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.exception.Timeout):
            pass  # Record type not found — expected
        except Exception as e:
            logger.warning(f"DNS {rtype} error for {domain}: {e}")

    return result
