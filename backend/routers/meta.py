from fastapi import APIRouter, HTTPException, Query

from services.pikalytics import CACHE_TTL_SECONDS, get_current_meta
import time

router = APIRouter()


@router.get("/pikalytics-usage")
async def get_pikalytics_usage(refresh: bool = Query(default=False)):
    """Usage data for whatever regulation Pikalytics currently serves."""
    try:
        snapshot = get_current_meta(force_refresh=refresh)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not reach Pikalytics: {e}")

    payload = snapshot.to_dict()
    payload["success"] = True
    payload["stale"] = (time.time() - snapshot.fetched_at) > CACHE_TTL_SECONDS
    payload["message"] = f"Usage data for {snapshot.format_name}"
    return payload


@router.get("/meta")
async def get_meta():
    """Format metadata only, for labelling the UI without shipping the full table."""
    try:
        snapshot = get_current_meta()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not reach Pikalytics: {e}")

    return {
        "format": snapshot.to_dict()["format"],
        "pokemon_count": len(snapshot.pokemon),
        "source_url": snapshot.to_dict()["source_url"],
    }
