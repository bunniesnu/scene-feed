from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, HttpUrl
from instaloader import Post

def _require_url(url: Optional[str], context: str):
    if url is None:
        raise ValueError(f"Missing expected URL: {context}")
    return HttpUrl(url)

class Dimensions(BaseModel):
    width: int
    height: int

class AudioInfo(BaseModel):
    artist_name: Optional[str] = None
    song_name: Optional[str] = None
    uses_original_audio: bool = False
    audio_id: Optional[str] = None

class OwnerInfo(BaseModel):
    id: str
    username: str
    full_name: Optional[str] = None
    is_verified: bool = False

class MediaItem(BaseModel):
    """A single downloadable media file (one slide of a sidecar, or the only item for a single post)."""

    media_url: HttpUrl = Field(..., description="Best-resolution video or photo URL")
    is_video: bool
    dimensions: Optional[Dimensions] = None
    video_duration: Optional[float] = None
    accessibility_caption: Optional[str] = None

class MediaArchiveEntry(BaseModel):
    """Archive record for a single Instagram post (photo, video, or sidecar/carousel)."""

    id: str
    shortcode: str
    post_url: HttpUrl
    typename: str  # "GraphImage", "GraphVideo", "GraphSidecar"
    is_video: bool  # true if the post itself is a video (false for sidecars, even if children are videos)

    taken_at: datetime
    owner: OwnerInfo
    caption: Optional[str] = None

    items: List[MediaItem] = Field(..., description="One entry for single posts; multiple for sidecars")
    thumbnail_url: HttpUrl = Field(..., description="Best-resolution cover/thumbnail for the post")

    audio: Optional[AudioInfo] = None

    @classmethod
    def from_post(cls, post: Post) -> "MediaArchiveEntry":
        items: List[MediaItem] = []

        if post.typename == "GraphSidecar":
            for node in post.get_sidecar_nodes():
                items.append(
                    MediaItem(
                        media_url=_require_url(node.video_url if node.is_video else node.display_url, f"sidecar node of {post.shortcode}"),
                        is_video=node.is_video,
                        # PostSidecarNode doesn't expose width/height/duration directly
                    )
                )
        else:
            items.append(
                MediaItem(
                    media_url=_require_url(post.video_url if post.is_video else post.url, f"post {post.shortcode}"),
                    is_video=post.is_video,
                    video_duration=getattr(post, "video_duration", None),
                    accessibility_caption=post.accessibility_caption,
                )
            )

        audio = None
        if post.is_video and getattr(post, "_node", None):
            music_info = post._node.get("clips_music_attribution_info")
            if music_info:
                audio = AudioInfo(**music_info)

        return cls(
            id=str(post.mediaid),
            shortcode=post.shortcode,
            post_url=_require_url(f"https://www.instagram.com/p/{post.shortcode}/", f"post URL for {post.shortcode}"),
            typename=post.typename,
            is_video=post.is_video,
            taken_at=post.date_utc,
            owner=OwnerInfo(
                id=str(post.owner_id),
                username=post.owner_username,
                full_name=getattr(post, "owner_profile", None) and post.owner_profile.full_name,
                is_verified=getattr(post, "owner_profile", None) and post.owner_profile.is_verified or False,
            ),
            caption=post.caption,
            items=items,
            thumbnail_url=_require_url(post.url, f"thumbnail URL for {post.shortcode}"),  # instaloader's .url is already the best-res display image
            audio=audio,
        )

    def to_json_dict(self) -> dict:
        """JSON-safe dict (datetime -> ISO 8601 string), ready for json.dump()."""
        return self.model_dump(mode="json")

def get_post_media_urls(context, shortcode: str) -> MediaArchiveEntry:
    post = Post.from_shortcode(context, shortcode)
    return MediaArchiveEntry.from_post(post)
