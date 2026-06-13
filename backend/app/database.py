import os
import json
import asyncpg
from typing import Optional, List
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL")


async def get_conn():
    return await asyncpg.connect(DATABASE_URL)


async def init_db():
    conn = await get_conn()
    try:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id          SERIAL PRIMARY KEY,
                email       TEXT UNIQUE NOT NULL,
                hashed_pw   TEXT NOT NULL,
                created_at  TIMESTAMPTZ DEFAULT NOW()
            )
        """)
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id          SERIAL PRIMARY KEY,
                user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
                domain      TEXT NOT NULL,
                scanned_at  TIMESTAMPTZ DEFAULT NOW(),
                duration_ms INTEGER,
                risk_level  TEXT,
                result_json JSONB NOT NULL
            )
        """)
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_scans_user ON scans(user_id)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_scans_domain ON scans(domain)")
    finally:
        await conn.close()


# ── User operations ──────────────────────────────────────────

async def create_user(email: str, hashed_pw: str) -> dict:
    conn = await get_conn()
    try:
        row = await conn.fetchrow(
            "INSERT INTO users (email, hashed_pw) VALUES ($1, $2) RETURNING id, email, created_at",
            email, hashed_pw
        )
        return dict(row)
    finally:
        await conn.close()


async def get_user_by_email(email: str) -> Optional[dict]:
    conn = await get_conn()
    try:
        row = await conn.fetchrow("SELECT * FROM users WHERE email = $1", email)
        return dict(row) if row else None
    finally:
        await conn.close()


async def get_user_by_id(user_id: int) -> Optional[dict]:
    conn = await get_conn()
    try:
        row = await conn.fetchrow("SELECT id, email, created_at FROM users WHERE id = $1", user_id)
        return dict(row) if row else None
    finally:
        await conn.close()


# ── Scan operations ──────────────────────────────────────────

async def save_scan(user_id: int, result_dict: dict) -> int:
    conn = await get_conn()
    try:
        risk = None
        ai = result_dict.get("ai_summary")
        if ai and not ai.get("error"):
            risk = ai.get("overall_risk")

        row = await conn.fetchrow(
            """
            INSERT INTO scans (user_id, domain, duration_ms, risk_level, result_json)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            """,
            user_id,
            result_dict["domain"],
            result_dict.get("duration_ms"),
            risk,
            json.dumps(result_dict),
        )
        return row["id"]
    finally:
        await conn.close()


async def get_scans(user_id: int, limit: int = 20, search: Optional[str] = None) -> List[dict]:
    conn = await get_conn()
    try:
        if search:
            rows = await conn.fetch(
                """
                SELECT id, domain, scanned_at, duration_ms, risk_level
                FROM scans WHERE user_id = $1 AND domain ILIKE $2
                ORDER BY scanned_at DESC LIMIT $3
                """,
                user_id, f"%{search}%", limit
            )
        else:
            rows = await conn.fetch(
                """
                SELECT id, domain, scanned_at, duration_ms, risk_level
                FROM scans WHERE user_id = $1
                ORDER BY scanned_at DESC LIMIT $2
                """,
                user_id, limit
            )
        return [dict(r) for r in rows]
    finally:
        await conn.close()


async def get_scan_by_id(scan_id: int, user_id: int) -> Optional[dict]:
    conn = await get_conn()
    try:
        row = await conn.fetchrow(
            "SELECT * FROM scans WHERE id = $1 AND user_id = $2",
            scan_id, user_id
        )
        if not row:
            return None
        data = dict(row)
        data["result"] = json.loads(data.pop("result_json"))
        return data
    finally:
        await conn.close()


async def delete_scan(scan_id: int, user_id: int) -> bool:
    conn = await get_conn()
    try:
        result = await conn.execute(
            "DELETE FROM scans WHERE id = $1 AND user_id = $2",
            scan_id, user_id
        )
        return result == "DELETE 1"
    finally:
        await conn.close()