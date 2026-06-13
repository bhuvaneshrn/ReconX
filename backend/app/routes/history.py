from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from pydantic import BaseModel
from app.database import get_scans, get_scan_by_id, delete_scan, save_scan
from app.deps import get_current_user
from app.models.schemas import ReconResult

router = APIRouter()


class ScanSummary(BaseModel):
    id: int
    domain: str
    scanned_at: str
    duration_ms: Optional[int] = None
    risk_level: Optional[str] = None


@router.post("/history/save")
async def save_scan_result(
    result: ReconResult,
    user: dict = Depends(get_current_user),
):
    scan_id = await save_scan(user["id"], result.model_dump())
    return {"id": scan_id, "domain": result.domain}


@router.get("/history", response_model=List[ScanSummary])
async def list_scans(
    limit: int = Query(default=20, le=100),
    search: Optional[str] = Query(default=None),
    user: dict = Depends(get_current_user),
):
    rows = await get_scans(user["id"], limit=limit, search=search)
    # Convert datetime to string for serialization
    for r in rows:
        if hasattr(r.get("scanned_at"), "isoformat"):
            r["scanned_at"] = r["scanned_at"].isoformat()
    return rows


@router.get("/history/{scan_id}")
async def get_scan(
    scan_id: int,
    user: dict = Depends(get_current_user),
):
    scan = await get_scan_by_id(scan_id, user["id"])
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if hasattr(scan.get("scanned_at"), "isoformat"):
        scan["scanned_at"] = scan["scanned_at"].isoformat()
    return scan


@router.delete("/history/{scan_id}")
async def remove_scan(
    scan_id: int,
    user: dict = Depends(get_current_user),
):
    deleted = await delete_scan(scan_id, user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {"message": f"Scan {scan_id} deleted"}