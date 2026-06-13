import httpx
import logging
from typing import Optional
from app.models.schemas import HeadersData

logger = logging.getLogger(__name__)

SECURITY_HEADERS = [
    "strict-transport-security",
    "content-security-policy",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy",
    "x-xss-protection",
]


async def run_headers(domain: str) -> Optional[HeadersData]:
    url = f"https://{domain}"
    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=10.0,
            verify=False,  # some domains have cert issues; we just want headers
        ) as client:
            response = await client.head(url)

        headers = dict(response.headers)

        # Extract common fields
        server = headers.get("server") or headers.get("x-powered-by")
        content_type = headers.get("content-type")
        x_powered_by = headers.get("x-powered-by")
        status_code = response.status_code

        # Check which security headers are present / missing
        security_headers_present = {}
        missing_security_headers = []

        for h in SECURITY_HEADERS:
            val = headers.get(h)
            if val:
                security_headers_present[h] = val
            else:
                missing_security_headers.append(h)

        # Detect tech stack hints from headers
        tech_hints = []
        tech_map = {
            "x-powered-by": lambda v: v,
            "server": lambda v: v,
            "x-aspnet-version": lambda v: f"ASP.NET {v}",
            "x-aspnetmvc-version": lambda v: f"ASP.NET MVC {v}",
            "x-drupal-cache": lambda _: "Drupal",
            "x-wp-total": lambda _: "WordPress",
            "x-shopify-stage": lambda _: "Shopify",
        }
        for header_key, label_fn in tech_map.items():
            val = headers.get(header_key)
            if val:
                hint = label_fn(val)
                if hint and hint not in tech_hints:
                    tech_hints.append(hint)

        return HeadersData(
            status_code=status_code,
            server=server,
            content_type=content_type,
            x_powered_by=x_powered_by,
            security_headers_present=security_headers_present,
            missing_security_headers=missing_security_headers,
            tech_hints=tech_hints,
            raw_headers=headers,
        )

    except httpx.ConnectError:
        # Try HTTP fallback
        try:
            url = f"http://{domain}"
            async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
                response = await client.head(url)
            headers = dict(response.headers)
            return HeadersData(
                status_code=response.status_code,
                server=headers.get("server"),
                content_type=headers.get("content-type"),
                x_powered_by=headers.get("x-powered-by"),
                security_headers_present={h: headers[h] for h in SECURITY_HEADERS if h in headers},
                missing_security_headers=[h for h in SECURITY_HEADERS if h not in headers],
                tech_hints=[],
                raw_headers=headers,
            )
        except Exception as e:
            logger.error(f"Headers fallback error for {domain}: {e}")
            raise
    except Exception as e:
        logger.error(f"Headers error for {domain}: {e}")
        raise