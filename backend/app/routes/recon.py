import asyncio
import time
import re
from fastapi import APIRouter, HTTPException, Request, Depends
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.models.schemas import ReconRequest, ReconResult
from app.modules import whois as whois_module
from app.modules import dns as dns_module
from app.modules import subdomains as subdomain_module
from app.modules import groq as groq_module
from app.modules import headers as headers_module
from app.modules import shodan as shodan_module
from app.deps import get_current_user

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

DOMAIN_RE = re.compile(
    r"^(?:[a-zA-Z0-9]"
    r"(?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+"
    r"[a-zA-Z]{2,}$"
)


def validate_domain(domain: str) -> str:
    domain = domain.strip().lower()
    for prefix in ("https://", "http://", "www."):
        if domain.startswith(prefix):
            domain = domain[len(prefix):]
    domain = domain.split("/")[0]
    if not DOMAIN_RE.match(domain):
        raise HTTPException(status_code=422, detail=f"Invalid domain: '{domain}'")
    return domain


@router.post("/recon", response_model=ReconResult)
@limiter.limit("10/minute")
async def run_recon(
    request: Request,
    body: ReconRequest,
    user: dict = Depends(get_current_user),
):
    domain = validate_domain(body.domain)
    start = time.time()
    errors = {}

    whois_task = asyncio.create_task(whois_module.run_whois(domain))
    dns_task = asyncio.create_task(dns_module.run_dns(domain))
    subdomain_task = asyncio.create_task(subdomain_module.run_subdomains(domain))
    headers_task = asyncio.create_task(headers_module.run_headers(domain))
    shodan_task = asyncio.create_task(shodan_module.run_shodan(domain))

    whois_data = dns_data = subdomains = headers_data = shodan_data = None

    try:
        whois_data = await whois_task
    except Exception as e:
        errors["whois"] = str(e)

    try:
        dns_data = await dns_task
    except Exception as e:
        errors["dns"] = str(e)

    try:
        subdomains = await subdomain_task
    except Exception as e:
        errors["subdomains"] = str(e)
        subdomains = []

    try:
        headers_data = await headers_task
    except Exception as e:
        errors["headers"] = str(e)

    try:
        shodan_data = await shodan_task
    except Exception as e:
        errors["shodan"] = str(e)

    ai_summary = None
    try:
        ai_summary = await groq_module.run_groq(
            domain=domain,
            whois=whois_data,
            dns=dns_data,
            subdomains=subdomains or [],
        )
    except Exception as e:
        errors["ai_summary"] = str(e)

    duration_ms = int((time.time() - start) * 1000)

    return ReconResult(
        domain=domain,
        whois=whois_data,
        dns=dns_data,
        subdomains=subdomains or [],
        headers=headers_data,
        shodan=shodan_data,
        ai_summary=ai_summary,
        errors=errors,
        duration_ms=duration_ms,
    )