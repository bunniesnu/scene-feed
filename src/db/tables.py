from datetime import datetime
from typing import Optional, List
from enum import Enum

from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import UniqueConstraint, Column, DateTime, func
from sqlalchemy.sql.functions import now


class TypenameEnum(str, Enum):
    image = "GraphImage"
    video = "GraphVideo"
    sidecar = "GraphSidecar"


class Owner(SQLModel, table=True):
    id: str = Field(primary_key=True)
    username: str = Field(index=True)
    full_name: Optional[str] = None
    is_verified: bool = False

    posts: List["MediaArchiveEntry"] = Relationship(back_populates="owner")


class MediaArchiveEntry(SQLModel, table=True):
    __tablename__ = "media_archive_entries" # pyright: ignore[reportAssignmentType]

    id: str = Field(primary_key=True)
    shortcode: str = Field(index=True, unique=True)
    post_url: str  # stable — links to instagram.com/p/<shortcode>, not a CDN URL

    typename: TypenameEnum
    is_video: bool

    taken_at: datetime = Field(index=True)
    caption: Optional[str] = None

    owner_id: str = Field(foreign_key="owner.id", index=True)
    owner: Owner = Relationship(back_populates="posts")

    items: List["MediaItem"] = Relationship(
        back_populates="entry",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    audio: Optional["AudioInfo"] = Relationship(
        back_populates="entry",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "uselist": False},
    )

    created_at: datetime = Field(
        default_factory=now,
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False
        )
    )


class MediaItem(SQLModel, table=True):
    __tablename__ = "media_items" # pyright: ignore[reportAssignmentType]
    __table_args__ = (UniqueConstraint("entry_id", "position"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    entry_id: str = Field(foreign_key="media_archive_entries.id", index=True)
    position: int = Field(default=0)

    is_video: bool
    width: Optional[int] = None
    height: Optional[int] = None
    video_duration: Optional[float] = None
    accessibility_caption: Optional[str] = None

    entry: MediaArchiveEntry = Relationship(back_populates="items")


class AudioInfo(SQLModel, table=True):
    __tablename__ = "audio_infos" # pyright: ignore[reportAssignmentType]

    id: Optional[int] = Field(default=None, primary_key=True)
    entry_id: str = Field(foreign_key="media_archive_entries.id", unique=True, index=True)

    artist_name: Optional[str] = None
    song_name: Optional[str] = None
    uses_original_audio: bool = False
    audio_id: Optional[str] = None

    entry: MediaArchiveEntry = Relationship(back_populates="audio")
