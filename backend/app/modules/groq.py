import os
import json
import logging
from groq import Groq
from app.models.schemas import AISummary, WhoisData, DNSData, SubdomainEntry
from typing import List, Optional

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a senior cybersecurity analyst. You will be given passive reconnaissance
data about a domain collected from public sources only. Analyze the findings and
return a structured JSON report with:
- overall_risk: one of "Low", "Medium", "High", or "Critical"
- key_findings: array of objects with "severity" (info/low/medium/high) and "finding" (string)
- recommendations: array of action strings the domain owner should take
- plain_summary: 2-3 sentences for a non-technical audience

Be factual. Do not speculate beyond the data provided. Return ONLY valid JSON, no markdown, no preamble."""


def build_recon_prompt(
    domain: str,
    whois: Optional[WhoisData],
    dns: Optional[DNSData],
    subdomains: List[SubdomainEntry],
) -> str:
    subdomain_list = [s.subdomain for s in subdomains[:50]]  # limit tokens

    data = {
        "domain": domain,
        "whois": {
            "registrar": whois.registrar if whois else None,
            "creation_date": whois.creation_date if whois else None,
            "expiration_date": whois.expiration_date if whois else None,
            "name_servers": whois.name_servers if whois else [],
            "dnssec": whois.dnssec if whois else None,
            "registrant_org": whois.registrant_org if whois else None,
            "registrant_country": whois.registrant_country if whois else None,
        } if whois else None,
        "dns": {
            "A_records": dns.A if dns else [],
            "MX_records": [r["exchange"] for r in (dns.MX if dns else [])],
            "NS_records": dns.NS if dns else [],
            "TXT_records": dns.TXT if dns else [],
        } if dns else None,
        "subdomains_found": len(subdomains),
        "subdomain_sample": subdomain_list,
    }

    return f"Analyze this passive recon data and return structured JSON:\n\n{json.dumps(data, indent=2)}"


async def run_groq(
    domain: str,
    whois: Optional[WhoisData],
    dns: Optional[DNSData],
    subdomains: List[SubdomainEntry],
) -> AISummary:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return AISummary(error="GROQ_API_KEY not configured")

    try:
        client = Groq(api_key=api_key)
        prompt = build_recon_prompt(domain, whois, dns, subdomains)

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=1000,
        )

        raw = response.choices[0].message.content.strip()

        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        parsed = json.loads(raw)
        return AISummary(
            overall_risk=parsed.get("overall_risk", "Unknown"),
            key_findings=parsed.get("key_findings", []),
            recommendations=parsed.get("recommendations", []),
            plain_summary=parsed.get("plain_summary", ""),
        )

    except json.JSONDecodeError as e:
        logger.error(f"Groq JSON parse error: {e}")
        return AISummary(error=f"AI returned malformed JSON: {str(e)}")
    except Exception as e:
        logger.error(f"Groq error: {e}")
        return AISummary(error=str(e))