import httpx
import logging
import asyncio
from typing import List
from app.models.schemas import SubdomainEntry

logger = logging.getLogger(__name__)

CRT_SH_URL = "https://crt.sh/"
TIMEOUT = 15.0
MAX_RESULTS = 100
MAX_RETRIES = 2


async def _fetch_crtsh(client: httpx.AsyncClient, domain: str) -> list:
    resp = await client.get(
        CRT_SH_URL,
        params={"q": f"%.{domain}", "output": "json"},
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    return resp.json()


async def run_subdomains(domain: str) -> List[SubdomainEntry]:
    async with httpx.AsyncClient(
        follow_redirects=True,
        headers={"User-Agent": "ReconX/2.0 passive-recon-tool"},
    ) as client:

        data = None
        last_error = None

        # Retry up to MAX_RETRIES times
        for attempt in range(MAX_RETRIES):
            try:
                data = await _fetch_crtsh(client, domain)
                break
            except (httpx.HTTPStatusError, httpx.TimeoutException, httpx.ConnectError) as e:
                last_error = e
                logger.warning(f"crt.sh attempt {attempt + 1} failed for {domain}: {e}")
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(2)  # wait before retry
            except Exception as e:
                last_error = e
                logger.error(f"crt.sh unexpected error for {domain}: {e}")
                break

        if data is None:
            # crt.sh is down — return empty list with a logged warning
            # rather than crashing the whole recon
            logger.error(f"crt.sh unavailable for {domain} after {MAX_RETRIES} attempts: {last_error}")
            return []

        # Deduplicate by subdomain name
        seen = set()
        results: List[SubdomainEntry] = []

        for entry in data:
            name = entry.get("name_value", "").strip().lower()
            if not name or name in seen:
                continue

            # crt.sh sometimes returns wildcard entries like *.example.com
            # split on newlines too (multi-SAN certs)
            for sub in name.splitlines():
                sub = sub.strip().lstrip("*.")
                if not sub or sub in seen:
                    continue
                if not sub.endswith(domain):
                    continue
                seen.add(sub)
                results.append(
                    SubdomainEntry(
                        subdomain=sub,
                        issuer=entry.get("issuer_name"),
                        logged_at=entry.get("entry_timestamp"),
                        not_before=entry.get("not_before"),
                        not_after=entry.get("not_after"),
                    )
                )

            if len(results) >= MAX_RESULTS:
                break

        return results[:MAX_RESULTS]