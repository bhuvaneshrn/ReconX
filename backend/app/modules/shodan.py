import os
import httpx
import logging
import asyncio
from typing import Optional
from app.models.schemas import ShodanData, ShodanHost

logger = logging.getLogger(__name__)

SHODAN_API_BASE = "https://api.shodan.io"


async def run_shodan(domain: str) -> Optional[ShodanData]:
    api_key = os.getenv("SHODAN_API_KEY")
    if not api_key:
        return ShodanData(error="SHODAN_API_KEY not configured")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Step 1: DNS resolve via Shodan to get IPs
            dns_resp = await client.get(
                f"{SHODAN_API_BASE}/dns/resolve",
                params={"hostnames": domain, "key": api_key},
            )
            dns_resp.raise_for_status()
            dns_data = dns_resp.json()
            ip = dns_data.get(domain)

            if not ip:
                return ShodanData(error="Could not resolve domain via Shodan")

            # Step 2: Host lookup
            host_resp = await client.get(
                f"{SHODAN_API_BASE}/shodan/host/{ip}",
                params={"key": api_key},
            )

            if host_resp.status_code == 404:
                return ShodanData(
                    ip=ip,
                    error="No Shodan data available for this IP",
                )

            host_resp.raise_for_status()
            host = host_resp.json()

            # Parse ports and services
            ports = sorted(set(host.get("ports", [])))
            services = []
            for item in host.get("data", []):
                services.append({
                    "port": item.get("port"),
                    "transport": item.get("transport", "tcp"),
                    "product": item.get("product"),
                    "version": item.get("version"),
                    "cpe": item.get("cpe", []),
                    "banner": (item.get("data", "") or "")[:200],  # truncate banners
                })

            # CVEs across all services
            vulns = []
            for item in host.get("data", []):
                for cve in item.get("vulns", {}).keys():
                    if cve not in vulns:
                        vulns.append(cve)

            return ShodanData(
                ip=ip,
                org=host.get("org"),
                isp=host.get("isp"),
                country=host.get("country_name"),
                city=host.get("city"),
                os=host.get("os"),
                ports=ports,
                services=services,
                vulns=vulns,
                last_update=host.get("last_update"),
                hostnames=host.get("hostnames", []),
                tags=host.get("tags", []),
            )

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 401:
            return ShodanData(error="Invalid Shodan API key")
        if e.response.status_code == 429:
            return ShodanData(error="Shodan rate limit exceeded")
        logger.error(f"Shodan HTTP error for {domain}: {e}")
        raise
    except Exception as e:
        logger.error(f"Shodan error for {domain}: {e}")
        raise