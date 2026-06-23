import re

from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/instagram",
    tags=["instagram"],
    responses={404: {"description": "Not found"}},
)

L = None  # Instaloader instance will be initialized on first request

SHORTCODE_PATTERN = re.compile(
    r"^https?://(?:www\.)?instagram\.com/(?:p|reel|tv)/([A-Za-z0-9_-]+)"
)


def extract_shortcode(url: str) -> str:
    match = SHORTCODE_PATTERN.search(url)
    if not match:
        raise ValueError("Invalid Instagram post URL")
    return match.group(1)


@router.get("/post")
async def get_post_media_urls(url: str):
    global L
    if L is None:
        from instaloader import Instaloader
        L = Instaloader()

    try:
        shortcode = extract_shortcode(url)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    from src.instagram.dl import get_post_media_urls
    return get_post_media_urls(L.context, shortcode)
