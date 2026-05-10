from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from google import genai
from google.genai import types
from config import GEMINI_API_KEY, GEMINI_MODEL
from database import save_message, get_chat_history, log_visitor, get_profile, update_profile
from auth import create_access_token, authenticate_user, verify_token
import os
import shutil

# --- Gemini Client ---
client = genai.Client(api_key=GEMINI_API_KEY)

# --- Router ---
router = APIRouter()

# --- Resume path ---
RESUME_PATH = "/root/tienmai-bot/uploads/resume.pdf"

# --- Models ---
class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

class LoginRequest(BaseModel):
    username: str
    password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    about: Optional[str] = None
    avatar: Optional[str] = None
    skills: Optional[List[str]] = None
    experiences: Optional[List[dict]] = None
    educations: Optional[List[dict]] = None
    projects: Optional[List[dict]] = None
    gallery: Optional[List[str]] = None
    theme: Optional[Dict[str, Any]] = None
    fonts: Optional[Dict[str, str]] = None

# --- Public: Profile ---
@router.get("/api/profile")
async def profile():
    """Return profile data from MongoDB."""
    data = await get_profile()
    return data

# --- Public: Resume file ---
@router.get("/api/resume/file")
async def get_resume():
    """Serve resume PDF file."""
    if not os.path.exists(RESUME_PATH):
        raise HTTPException(status_code=404, detail="Resume not found")
    return FileResponse(
        RESUME_PATH,
        media_type="application/pdf",
        filename="Tien_Mai_Resume.pdf"
    )

# --- Public: Check resume exists ---
@router.get("/api/resume/exists")
async def resume_exists():
    """Check if resume file exists."""
    return {"exists": os.path.exists(RESUME_PATH)}

# --- Public: Chat ---
@router.post("/api/chat")
async def web_chat(request: ChatRequest):
    """Web chatbot endpoint - saves history to MongoDB."""
    session_id = request.session_id
    user_text = request.message

    try:
        await log_visitor(session_id)
        await save_message(session_id, "user", user_text, source="web")

        history = await get_chat_history(session_id, limit=20)
        contents = [
            types.Content(role=msg["role"], parts=[types.Part(text=msg["content"])])
            for msg in history
        ]

        response = client.models.generate_content(model=GEMINI_MODEL, contents=contents)
        reply = response.text

        await save_message(session_id, "model", reply, source="web")
        return {"reply": reply}

    except Exception as e:
        print(f"Web chat error: {e}")
        return {"reply": "Sorry, I'm having trouble processing that right now."}

# --- Admin: Login ---
@router.post("/api/admin/login")
async def admin_login(request: LoginRequest):
    """Admin login - returns JWT token."""
    if not authenticate_user(request.username, request.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token({"sub": request.username})
    return {"access_token": token, "token_type": "bearer"}

# --- Admin: Update Profile ---
@router.put("/api/admin/profile")
async def admin_update_profile(data: ProfileUpdate, username: str = Depends(verify_token)):
    """Update profile fields - requires JWT token."""
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    await update_profile(updates)
    return {"message": "Profile updated successfully"}

# --- Admin: Update Gallery ---
@router.put("/api/admin/gallery")
async def admin_update_gallery(gallery: List[str], username: str = Depends(verify_token)):
    """Update gallery images and order - requires JWT token."""
    await update_profile({"gallery": gallery})
    return {"message": "Gallery updated successfully"}

# --- Admin: Upload Resume ---
@router.post("/api/admin/resume")
async def upload_resume(file: UploadFile = File(...), username: str = Depends(verify_token)):
    """Upload resume PDF - replaces existing file."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    os.makedirs(os.path.dirname(RESUME_PATH), exist_ok=True)
    with open(RESUME_PATH, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"message": "Resume uploaded successfully"}

# --- Admin: Delete Resume ---
@router.delete("/api/admin/resume")
async def delete_resume(username: str = Depends(verify_token)):
    """Delete resume file."""
    if os.path.exists(RESUME_PATH):
        os.remove(RESUME_PATH)
    return {"message": "Resume deleted successfully"}
