# ReconX 🔍

> Automated passive OSINT reconnaissance dashboard — zero packets sent to the target.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?style=flat-square&logo=postgresql)](https://neon.tech)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## 🚀 Live Demo

**[https://recon-x-zeta.vercel.app](https://recon-x-zeta.vercel.app)**

> ⚠️ For authorized use only. ReconX queries public data sources exclusively — no active scanning, no packets sent to targets.

---

## ✨ Features

- **WHOIS Lookup** — Registrar, creation/expiry dates, registrant org, nameservers, DNSSEC status
- **DNS Enumeration** — A, AAAA, MX, NS, TXT, CNAME, SOA records
- **Subdomain Discovery** — Certificate Transparency log search via crt.sh with List + D3.js Tree view
- **HTTP Header Analysis** — Security header scoring, tech stack fingerprinting, missing header detection
- **Shodan Integration** — Open ports, running services, CVE lookup, ISP/org info
- **AI Risk Summary** — Groq-powered (Llama 3.3 70B) threat analysis with risk rating and recommendations
- **Scan History** — PostgreSQL-backed per-user scan history with search and delete
- **Export Reports** — Download full recon reports as JSON or TXT
- **JWT Authentication** — Secure register/login with token-based auth
- **Rate Limiting** — 10 requests/minute per IP to prevent abuse

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| D3.js | Subdomain tree visualization |
| Lucide React | Icons |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| Python 3.11 | Runtime |
| asyncpg | Async PostgreSQL driver |
| bcrypt + PyJWT | Auth & token management |
| httpx | Async HTTP requests |
| Groq SDK | AI risk analysis |
| slowapi | Rate limiting |

### Infrastructure
| Service | Purpose |
|---|---|
| Neon.tech | Hosted PostgreSQL database |
| Railway | Backend deployment |
| Vercel | Frontend deployment |
| GitHub | Version control + CI/CD |

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Neon.tech](https://neon.tech) PostgreSQL database
- [Groq](https://console.groq.com) API key (free)
- [Shodan](https://shodan.io) API key (free tier)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Create `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require
GROQ_API_KEY=your_groq_key
SHODAN_API_KEY=your_shodan_key
JWT_SECRET=your_jwt_secret
```

```bash
uvicorn main:app --reload
# API running at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

```bash
npm run dev
# App running at http://localhost:5173
```

---

## 🔒 Security & Ethics

- **Passive only** — ReconX exclusively queries public data sources (WHOIS registries, DNS resolvers, Certificate Transparency logs, Shodan's pre-indexed database, HTTP headers)
- **No active scanning** — zero packets are sent directly to target servers beyond a standard HTTP HEAD request for headers
- **Rate limited** — 10 scans/minute per IP
- **Auth required** — all scan endpoints require JWT authentication
- **For authorized use only** — only scan domains you own or have explicit permission to research

---

## 📁 Project Structure

```
reconx/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── railway.toml
│   └── app/
│       ├── auth.py
│       ├── database.py
│       ├── deps.py
│       ├── models/
│       │   └── schemas.py
│       ├── modules/
│       │   ├── dns.py
│       │   ├── groq.py
│       │   ├── headers.py
│       │   ├── shodan.py
│       │   ├── subdomains.py
│       │   └── whois.py
│       └── routes/
│           ├── auth_routes.py
│           ├── export.py
│           ├── history.py
│           └── recon.py
└── frontend/
    ├── vercel.json
    └── src/
        ├── components/
        ├── hooks/
        └── utils/
```

## 📄 License
This project is licensed under the MIT License – feel free to use, modify, and share.