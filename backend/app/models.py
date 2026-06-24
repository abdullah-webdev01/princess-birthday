from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class GuestCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    invitation_code: str
    attending: Optional[bool] = False
    attendees_count: Optional[int] = 1
    message: Optional[str] = None

class WishCreate(BaseModel):
    guest_name: str
    message: str

class PhotoCreate(BaseModel):
    guest_name: str
    image_url: str
    caption: Optional[str] = None

class SettingsUpdate(BaseModel):
    event_date: Optional[date] = None
    event_time: Optional[time] = None
    venue: Optional[str] = None
    memory_mode: Optional[bool] = None
    music_enabled: Optional[bool] = None
    banner_title: Optional[str] = None