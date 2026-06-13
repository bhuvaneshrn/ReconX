# ReconX — Automated OSINT & Recon Dashboard

> Passive, read-only reconnaissance. Aggregates WHOIS, DNS, subdomain, and AI risk analysis in one dashboard.

![Phase](https://img.shields.io/badge/Phase-1%20%2F%204-cyan)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20FastAPI-blue)
![License](https://img.shields.io/badge/Use-Authorized%20Domains%20Only-red)

---

## ⚠️ Legal Disclaimer

This tool performs **passive, read-only** queries against public data sources only.  
It does **not** send any requests directly to target servers.  
**Use only on domains you own or have explicit written permission to test.**  
The authors are not responsible for misuse.

---

## Features (Phase 1)

| Module | Source | Status |
|--------|--------|--------|
| WHOIS Lookup | python-whois | ✅ |
| DNS Enumeration | dnspython | ✅ |
| Subdomain Discovery | crt.sh (cert transparency) | ✅ |
| AI Risk Summary | Google Gemini API | ✅ (requires key) |
| HTTP Header Analysis | httpx | 🟡 Phase 2 |
| Shodan Integration | Shodan API | 🟡 Phase 2 (key required) |
| Recon History | SQLite | 🟡 Phase 3 |
| PDF Export | ReportLab | 🟡 Phase 3 |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- Gemini API key (free at [aistudio.google.com](https://aistudio.google.com/app/apikey))
- Shodan API key (free at [account.shodan.io](https://account.shodan.io/)) — used in Phase 2

### 1. Clone & configure

```bash
git clone https://github.com/yourusername/reconx.git
cd reconx
```

**Backend:**
```bash
cd backend
cp .env.example .env
# Fill in GEMINI_API_KEY in .env
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Docker (optional)

```bash
cp backend/.env.example backend/.env
# Fill in your keys in backend/.env
docker-compose up --build
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Backend | FastAPI (Python 3.12) |
| WHOIS | python-whois |
| DNS | dnspython |
| Subdomains | crt.sh API |
| AI | Google Gemini 1.5 Flash |
| Deployment | Vercel (FE) + Railway (BE) |

---

## Project Structure

```
reconx/
├── frontend/
│   └── src/
│       ├── components/   # WhoisCard, DNSTable, SubdomainList, AISummaryPanel
│       ├── hooks/        # useRecon
│       ├── utils/        # api.ts, types.ts
│       └── App.tsx
├── backend/
│   ├── app/
│   │   ├── modules/      # whois.py, dns.py, subdomains.py, gemini.py
│   │   ├── routes/       # recon.py
│   │   └── models/       # schemas.py
│   └── main.py
└── docker-compose.yml
```

---

## Roadmap

- **Phase 2** — HTTP header analysis, Shodan integration, D3.js subdomain tree
- **Phase 3** — SQLite history, PDF export, Vercel + Railway deployment
- **Phase 4** — HackerTarget reverse IP, shareable URLs, dark/light toggle

---

*Built as a public portfolio project demonstrating full-stack development, API orchestration, and AI integration. For educational and authorized use only.*
