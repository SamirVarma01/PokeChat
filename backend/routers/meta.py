from fastapi import APIRouter, HTTPException, Query

from services.pikalytics import CACHE_TTL_SECONDS, get_current_meta, get_pokemon_detail
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


@router.get("/pokemon/{name}")
async def get_pokemon(name: str):
    """Dex entry for one Pokemon in the current regulation."""
    try:
        snapshot = get_current_meta()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not reach Pikalytics: {e}")

    detail = get_pokemon_detail(name, snapshot.format_code)
    if not detail:
        raise HTTPException(status_code=404, detail=f"No data for {name} in {snapshot.format_name}")

    usage = next((p for p in snapshot.pokemon if p.name.lower() == name.lower()), None)

    return {
        "detail": detail.to_dict(),
        "usage": {"usage": usage.usage, "rank": usage.rank, "win_rate": usage.win_rate, "record": usage.record}
        if usage
        else None,
        "format": snapshot.to_dict()["format"],
        "source_url": f"https://www.pikalytics.com/pokedex/{snapshot.format_code}/{name}",
    }


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
