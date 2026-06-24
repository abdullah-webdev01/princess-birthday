from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from .database import supabase
from .models import *
import uuid, os
import httpx
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://princess-birthday-pi.vercel.app",
    "https://princess-birthday.vercel.app",
    "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Princess Birthday API"}

# ========== PUBLIC ==========
@app.get("/settings")
def get_settings():
    try:
        res = supabase.table("settings").select("*").eq("id", 1).execute()
        settings = res.data[0] if res.data else {}
        if settings:
            event_date = settings.get("event_date")
            event_time = settings.get("event_time")
            if event_date and event_time:
                try:
                    dt_str = f"{event_date} {event_time}"
                    event_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
                    now = datetime.now()
                    if now > event_dt and not settings.get("memory_gallery_enabled"):
                        supabase.table("settings").update({"memory_gallery_enabled": True}).eq("id", 1).execute()
                        settings["memory_gallery_enabled"] = True
                except Exception as e:
                    print("Error parsing event time:", e)
        return settings
    except Exception as e:
        print("Error in get_settings:", e)
        return {}

@app.get("/guests")
def get_guests():
    try:
        res = supabase.table("guests").select("*").execute()
        return res.data
    except Exception as e:
        print("Error in get_guests:", e)
        return []

@app.post("/guests")
def create_guest(guest: GuestCreate):
    try:
        res = supabase.table("guests").insert(guest.dict()).execute()
        return res.data
    except Exception as e:
        print("Error in create_guest:", e)
        raise HTTPException(500, str(e))

@app.get("/wishes")
def get_wishes(approved: bool = True):
    try:
        res = supabase.table("wishes").select("*").eq("approved", approved).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        print("Error in get_wishes:", e)
        return []

@app.post("/wishes")
def create_wish(wish: WishCreate):
    try:
        res = supabase.table("wishes").insert(wish.dict()).execute()
        return res.data
    except Exception as e:
        print("Error in create_wish:", e)
        raise HTTPException(500, str(e))

@app.get("/photos")
def get_photos(approved_only: bool = True):
    try:
        if approved_only:
            res = supabase.table("photos").select("*").eq("approved", True).order("likes", desc=True).execute()
        else:
            res = supabase.table("photos").select("*").order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        print("Error in get_photos:", e)
        return []

@app.post("/photos/upload")
async def upload_photo(guest_name: str = "Guest", caption: str = "", file: UploadFile = File(...)):
    try:
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(400, "File too large (max 10MB)")
        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        res = supabase.storage.from_("memories").upload(filename, content, {"content-type": file.content_type})
        if res.status_code != 200:
            raise HTTPException(400, f"Upload failed: {res.text}")
        public_url = supabase.storage.from_("memories").get_public_url(filename)
        data = {"guest_name": guest_name, "image_url": public_url, "caption": caption, "approved": False}
        res2 = supabase.table("photos").insert(data).execute()
        return {"message": "Uploaded for approval", "photo": res2.data[0]}
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(500, str(e))

class LikeRequest(BaseModel):
    guest_name: str

@app.post("/photos/{photo_id}/like")
def like_photo(photo_id: str, request: LikeRequest):
    try:
        guest_name = request.guest_name
        existing = supabase.table("reactions").select("*").eq("photo_id", photo_id).eq("guest_name", guest_name).execute()
        if existing.data:
            supabase.table("reactions").delete().eq("photo_id", photo_id).eq("guest_name", guest_name).execute()
            supabase.rpc("decrement_likes", {"pid": photo_id}).execute()
            return {"liked": False}
        else:
            supabase.table("reactions").insert({"photo_id": photo_id, "guest_name": guest_name}).execute()
            supabase.rpc("increment_likes", {"pid": photo_id}).execute()
            return {"liked": True}
    except Exception as e:
        print("Error in like_photo:", e)
        raise HTTPException(500, str(e))

@app.get("/video/likes")
def get_video_likes():
    try:
        res = supabase.table("video_likes").select("count").eq("id", 1).execute()
        return {"likes": res.data[0]["count"] if res.data else 0}
    except Exception as e:
        print("Error in get_video_likes:", e)
        return {"likes": 0}

@app.post("/video/like")
def toggle_video_like():
    try:
        res = supabase.table("video_likes").select("count").eq("id", 1).execute()
        if res.data:
            new_count = res.data[0]["count"] + 1
            supabase.table("video_likes").update({"count": new_count}).eq("id", 1).execute()
            return {"likes": new_count}
        else:
            supabase.table("video_likes").insert({"id": 1, "count": 1}).execute()
            return {"likes": 1}
    except Exception as e:
        print("Error in toggle_video_like:", e)
        return {"likes": 0}

@app.get("/video/comments")
def get_video_comments(approved: bool = True):
    try:
        res = supabase.table("video_comments").select("*").eq("approved", approved).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        print("Error in get_video_comments:", e)
        return []

@app.post("/video/comments")
def add_video_comment(data: dict):
    try:
        data["approved"] = False
        res = supabase.table("video_comments").insert(data).execute()
        return res.data
    except Exception as e:
        print("Error in add_video_comment:", e)
        raise HTTPException(500, str(e))

# ========== PUBLIC STORY PHOTOS (LIMITED TO 7) ==========
@app.get("/story/photos")
def get_story_photos_public():
    try:
        res = supabase.table("story_photos").select("*").order("order").limit(7).execute()
        return res.data
    except Exception as e:
        print("Error in get_story_photos_public:", e)
        return []

# ========== ADMIN ==========
@app.get("/admin/settings")
def admin_get_settings():
    try:
        res = supabase.table("settings").select("*").eq("id", 1).execute()
        return res.data[0] if res.data else {}
    except Exception as e:
        print("Error in admin_get_settings:", e)
        return {}

@app.put("/admin/settings")
def admin_update_settings(settings: dict):
    try:
        settings.pop("id", None)
        supabase.table("settings").update(settings).eq("id", 1).execute()
        return {"status": "updated"}
    except Exception as e:
        print("Error in admin_update_settings:", e)
        raise HTTPException(500, str(e))

@app.get("/admin/wishes")
def admin_get_all_wishes():
    try:
        res = supabase.table("wishes").select("*").order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        print("Error in admin_get_all_wishes:", e)
        return []

@app.put("/admin/wishes/{wish_id}/approve")
def admin_approve_wish(wish_id: str):
    try:
        supabase.table("wishes").update({"approved": True}).eq("id", wish_id).execute()
        return {"status": "approved"}
    except Exception as e:
        print("Error in admin_approve_wish:", e)
        raise HTTPException(500, str(e))

@app.delete("/admin/wishes/{wish_id}")
def admin_delete_wish(wish_id: str):
    try:
        supabase.table("wishes").delete().eq("id", wish_id).execute()
        return {"status": "deleted"}
    except Exception as e:
        print("Error in admin_delete_wish:", e)
        raise HTTPException(500, str(e))

@app.get("/admin/photos")
def admin_get_all_photos():
    try:
        res = supabase.table("photos").select("*").order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        print("Error in admin_get_all_photos:", e)
        return []

@app.put("/admin/photos/{photo_id}/approve")
def admin_approve_photo(photo_id: str):
    try:
        supabase.table("photos").update({"approved": True}).eq("id", photo_id).execute()
        return {"status": "approved"}
    except Exception as e:
        print("Error in admin_approve_photo:", e)
        raise HTTPException(500, str(e))

@app.delete("/admin/photos/{photo_id}")
def admin_delete_photo(photo_id: str):
    try:
        photo = supabase.table("photos").select("image_url").eq("id", photo_id).execute()
        if photo.data:
            url = photo.data[0]["image_url"]
            filename = url.split("/")[-1]
            supabase.storage.from_("memories").remove([filename])
            supabase.table("photos").delete().eq("id", photo_id).execute()
        return {"status": "deleted"}
    except Exception as e:
        print("Error in admin_delete_photo:", e)
        raise HTTPException(500, str(e))

class MemoryModeRequest(BaseModel):
    enabled: bool

@app.post("/admin/memory-mode")
def admin_toggle_memory_mode(request: MemoryModeRequest):
    try:
        supabase.table("settings").update({"memory_gallery_enabled": request.enabled}).eq("id", 1).execute()
        return {"memory_gallery_enabled": request.enabled}
    except Exception as e:
        print("Error in admin_toggle_memory_mode:", e)
        raise HTTPException(500, str(e))

@app.get("/admin/video/comments")
def admin_get_video_comments():
    try:
        res = supabase.table("video_comments").select("*").order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        print("Error in admin_get_video_comments:", e)
        return []

@app.put("/admin/video/comments/{comment_id}/approve")
def admin_approve_video_comment(comment_id: str):
    try:
        supabase.table("video_comments").update({"approved": True}).eq("id", comment_id).execute()
        return {"status": "approved"}
    except Exception as e:
        print("Error in admin_approve_video_comment:", e)
        raise HTTPException(500, str(e))

@app.delete("/admin/video/comments/{comment_id}")
def admin_delete_video_comment(comment_id: str):
    try:
        supabase.table("video_comments").delete().eq("id", comment_id).execute()
        return {"status": "deleted"}
    except Exception as e:
        print("Error in admin_delete_video_comment:", e)
        raise HTTPException(500, str(e))

# ===== ADMIN: HERO UPLOAD (IMPROVED) =====
@app.post("/admin/hero/upload")
async def admin_upload_hero(file: UploadFile = File(...)):
    try:
        # Check file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(400, "Only image files are allowed")
        
        # Generate filename
        ext = file.filename.split(".")[-1]
        filename = f"hero_{uuid.uuid4()}.{ext}"
        
        # Read file content
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:  # 5MB
            raise HTTPException(400, "File too large (max 5MB)")
        
        # Upload to Supabase Storage
        res = supabase.storage.from_("memories").upload(
            filename, 
            content, 
            {"content-type": file.content_type}
        )
        
        # Check response
        if res.status_code != 200:
            # If bucket doesn't exist, create it
            if "bucket not found" in str(res.text):
                try:
                    supabase.storage.create_bucket("memories", {"public": True})
                    # Retry upload
                    res = supabase.storage.from_("memories").upload(
                        filename, content, {"content-type": file.content_type}
                    )
                    if res.status_code != 200:
                        raise HTTPException(400, f"Upload failed after bucket creation: {res.text}")
                except Exception as bucket_error:
                    raise HTTPException(400, f"Bucket creation failed: {bucket_error}")
            else:
                raise HTTPException(400, f"Upload failed: {res.text}")
        
        # Get public URL
        public_url = supabase.storage.from_("memories").get_public_url(filename)
        
        # Update settings
        supabase.table("settings").update({"hero_image_url": public_url}).eq("id", 1).execute()
        
        return {"url": public_url}
    
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Hero upload error: {e}")
        raise HTTPException(500, f"Server error: {str(e)}")

# ===== ADMIN: STORY PHOTOS =====
@app.get("/admin/story/photos")
def admin_get_story_photos():
    try:
        res = supabase.table("story_photos").select("*").order("order").execute()
        return res.data
    except Exception as e:
        print("Error in admin_get_story_photos:", e)
        return []

@app.post("/admin/story/photos/upload")
async def admin_upload_story_photo(
    caption: str = Form(""),
    span: int = Form(1),
    file: UploadFile = File(...)
):
    try:
        ext = file.filename.split(".")[-1]
        filename = f"story_{uuid.uuid4()}.{ext}"
        content = await file.read()
        res = supabase.storage.from_("memories").upload(filename, content, {"content-type": file.content_type})
        if res.status_code != 200:
            raise HTTPException(400, "Upload failed")
        public_url = supabase.storage.from_("memories").get_public_url(filename)
        existing = supabase.table("story_photos").select("order").order("order", desc=True).limit(1).execute()
        max_order = existing.data[0]["order"] + 1 if existing.data else 0
        data = {"image_url": public_url, "caption": caption, "order": max_order, "span": span}
        res2 = supabase.table("story_photos").insert(data).execute()
        return {"message": "Uploaded", "photo": res2.data[0]}
    except Exception as e:
        print("Story upload error:", e)
        raise HTTPException(500, str(e))

@app.delete("/admin/story/photos/{photo_id}")
def admin_delete_story_photo(photo_id: str):
    try:
        photo = supabase.table("story_photos").select("image_url").eq("id", photo_id).execute()
        if photo.data:
            url = photo.data[0]["image_url"]
            filename = url.split("/")[-1]
            supabase.storage.from_("memories").remove([filename])
            supabase.table("story_photos").delete().eq("id", photo_id).execute()
        return {"status": "deleted"}
    except Exception as e:
        print("Story delete error:", e)
        raise HTTPException(500, str(e))

@app.put("/admin/story/photos/reorder")
def admin_reorder_story_photos(data: dict):
    try:
        order_list = data.get("order", [])
        for idx, photo_id in enumerate(order_list):
            supabase.table("story_photos").update({"order": idx}).eq("id", photo_id).execute()
        return {"status": "reordered"}
    except Exception as e:
        print("Reorder error:", e)
        raise HTTPException(500, str(e))

# ===== ADMIN: VIDEO UPLOAD =====
@app.post("/admin/video/upload")
async def admin_upload_video(file: UploadFile = File(...)):
    try:
        allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
        if file.content_type not in allowed:
            raise HTTPException(400, f"Unsupported file type: {file.content_type}. Allowed: MP4, WebM, OGG, MOV")
        
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(400, "File too large (max 50MB)")
        
        ext = file.filename.split(".")[-1]
        filename = f"videos/{uuid.uuid4()}.{ext}"
        
        res = supabase.storage.from_("memories").upload(
            filename, 
            content, 
            {"content-type": file.content_type}
        )
        if res.status_code != 200:
            raise HTTPException(400, f"Storage upload failed: {res.text}")
        
        public_url = supabase.storage.from_("memories").get_public_url(filename)
        supabase.table("settings").update({"video_url": public_url}).eq("id", 1).execute()
        
        return {"url": public_url}
    
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Video upload error: {e}")
        raise HTTPException(500, f"Server error: {str(e)}")