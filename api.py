from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from google import genai
from google.genai import types
from config import GEMINI_API_KEY
from database import (save_message, get_chat_history, log_visitor, get_profile, update_profile,
                      get_analytics_data, is_first_web_message, get_ai_settings, update_ai_settings,
                      set_admin_credentials, get_admin_token_version, increment_admin_token_version,
                      log_admin_login, get_admin_login_history,
                      get_jobtracker_users, get_jobtracker_user,
                      create_jobtracker_user, update_jobtracker_password, delete_jobtracker_user,
                      get_jobtracker_jobs, set_jobtracker_jobs, get_jt_profile, update_jt_profile)
from notifications import notify_new_chat, notify_jd_upload
from auth import create_access_token, authenticate_user, verify_token, hash_password, create_jobtracker_token, verify_jobtracker_token
import asyncio
import os
from time import time as _now
import shutil
import base64
import docx
import io
import json
import re
import pdfplumber

# --- Gemini Client ---
client = genai.Client(api_key=GEMINI_API_KEY)

# --- Admin login rate limiting (in-memory, resets on restart) ---
_login_attempts: dict = {}  # ip -> {"count": int, "locked_until": float}
_MAX_ATTEMPTS = 5
_LOCKOUT_SECONDS = 300  # 5 minutes

def _check_login_rate(ip: str):
    entry = _login_attempts.get(ip)
    if not entry:
        return
    if entry["locked_until"] > _now():
        remaining = int(entry["locked_until"] - _now())
        mins, secs = divmod(remaining, 60)
        raise HTTPException(
            status_code=429,
            detail={"message": f"Too many failed attempts. Try again in {mins}m {secs}s.", "locked_until": entry["locked_until"]}
        )

def _record_login_failure(ip: str):
    entry = _login_attempts.get(ip, {"count": 0, "locked_until": 0.0})
    entry["count"] += 1
    if entry["count"] >= _MAX_ATTEMPTS:
        entry["locked_until"] = _now() + _LOCKOUT_SECONDS
    _login_attempts[ip] = entry

def _reset_login_attempts(ip: str):
    _login_attempts.pop(ip, None)

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
    phone: Optional[str] = None
    github: Optional[str] = None
    gitlab: Optional[str] = None
    linkedin: Optional[str] = None
    about: Optional[str] = None
    avatar: Optional[str] = None
    skills: Optional[List[Any]] = None  # List[str] or List[dict] with {group, items}
    experiences: Optional[List[dict]] = None
    educations: Optional[List[dict]] = None
    projects: Optional[List[dict]] = None
    certifications: Optional[List[dict]] = None
    gallery: Optional[List[str]] = None
    theme: Optional[Dict[str, Any]] = None
    fonts: Optional[Dict[str, str]] = None
    openToWork: Optional[bool] = None
    resumeVisible: Optional[bool] = None

# --- Build system prompt from profile ---
def build_system_prompt(profile: dict) -> str:
    name = profile.get("name", "")
    title = profile.get("title", "")
    location = profile.get("location", "")
    email = profile.get("email", "")
    phone = profile.get("phone", "")
    linkedin = profile.get("linkedin", "")
    about = profile.get("about", "")
    raw_skills = profile.get("skills", [])
    if raw_skills and isinstance(raw_skills[0], dict):
        skills = ", ".join(s for g in raw_skills for s in g.get("items", []))
    else:
        skills = ", ".join(raw_skills)

    experiences = ""
    for exp in profile.get("experiences", []):
        experiences += f"\n- {exp.get('role')} at {exp.get('company')} ({exp.get('period')}): {exp.get('description', '')}"

    educations = ""
    for edu in profile.get("educations", []):
        educations += f"\n- {edu.get('degree')} at {edu.get('school')} ({edu.get('period')})"

    projects = ""
    for proj in profile.get("projects", []):
        projects += f"\n- {proj.get('title')} [{proj.get('tag')}]: {proj.get('description', '')}"

    return f"""You are {name}. You are responding directly as {name} — not as an AI assistant, but as the person themselves.

When someone asks about your background, experience, skills, or career, answer in first person as {name} would naturally speak.
Always respond in the same language the user is writing in.
Be warm, confident, and professional — like you're having a real conversation with a recruiter or headhunter who reached out to you.
If asked something not in your profile, say you'd be happy to discuss it further via email or LinkedIn.
When someone shares a job description (JD), give an honest assessment of how well it fits your background: what aligns well, what gaps exist, and whether you'd be interested.

Never break character or refer to yourself as an AI. You are {name}.

=== YOUR PROFILE ===

Name: {name}
Title: {title}
Location: {location}
Email: {email}
Phone: {phone}
LinkedIn: {linkedin}

About me:
{about}

My skills: {skills}

My work experience:{experiences}

My education:{educations}

My projects:{projects}

=== END OF PROFILE ===

Only speak based on the profile information above. Do not invent details not provided."""

# --- Extract text from docx ---
def extract_docx_text(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])

# --- Extract text from PDF ---
def extract_pdf_text(source) -> str:
    src = io.BytesIO(source) if isinstance(source, bytes) else source
    with pdfplumber.open(src) as pdf:
        return "\n".join(p.extract_text() or "" for p in pdf.pages).strip()

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
    return FileResponse(RESUME_PATH, media_type="application/pdf", filename="Tien_Mai_Resume.pdf")

# --- Public: Check resume exists ---
@router.get("/api/resume/exists")
async def resume_exists():
    """Check if resume file exists."""
    return {"exists": os.path.exists(RESUME_PATH)}

# --- Public: Chat (text only) ---
@router.post("/api/chat")
async def web_chat(request: ChatRequest):
    """Web chatbot endpoint - RAG with profile data."""
    session_id = request.session_id
    user_text = request.message

    try:
        await log_visitor(session_id)
        first = await is_first_web_message(session_id)
        await save_message(session_id, "user", user_text, source="web")
        if first:
            await notify_new_chat(user_text)

        profile = await get_profile()
        system_prompt = build_system_prompt(profile)
        ai_settings = await get_ai_settings()
        model = ai_settings.get("active_model")

        history = await get_chat_history(session_id, limit=20)
        contents = [
            types.Content(role=msg["role"], parts=[types.Part(text=msg["content"])])
            for msg in history
        ]

        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system_prompt)
        )
        reply = response.text

        await save_message(session_id, "model", reply, source="web")
        return {"reply": reply}

    except Exception as e:
        print(f"Web chat error: {e}")
        return {"reply": "Sorry, I'm having trouble processing that right now."}

# --- Public: Chat with file ---
@router.post("/api/chat/file")
async def web_chat_file(
    message: str = Form(default="Please analyze this job description and evaluate how well it matches my profile."),
    session_id: str = Form(default="default"),
    file: UploadFile = File(...)
):
    """Web chatbot endpoint - chat with file attachment."""
    try:
        await log_visitor(session_id)

        file_bytes = await file.read()
        filename = file.filename.lower()
        profile = await get_profile()
        system_prompt = build_system_prompt(profile)
        ai_settings = await get_ai_settings()
        model = ai_settings.get("active_model")

        # Build message label for history
        user_label = f"[Uploaded file: {file.filename}] {message}"
        await save_message(session_id, "user", user_label, source="web")

        # Get history (excluding current)
        history = await get_chat_history(session_id, limit=18)
        history_contents = [
            types.Content(role=msg["role"], parts=[types.Part(text=msg["content"])])
            for msg in history[:-1]  # Exclude the just-saved message
        ]

        # Build current message with file
        if filename.endswith(".pdf"):
            file_part = types.Part(
                inline_data=types.Blob(
                    mime_type="application/pdf",
                    data=base64.b64encode(file_bytes).decode()
                )
            )
            current_parts = [file_part, types.Part(text=message)]
        elif filename.endswith(".docx"):
            extracted_text = extract_docx_text(file_bytes)
            current_parts = [types.Part(text=f"File content ({file.filename}):\n\n{extracted_text}\n\n{message}")]
        elif filename.endswith(".txt"):
            text_content = file_bytes.decode("utf-8", errors="ignore")
            current_parts = [types.Part(text=f"File content ({file.filename}):\n\n{text_content}\n\n{message}")]
        else:
            return {"reply": "Sorry, only PDF, Word (.docx), and Text (.txt) files are supported."}

        current_content = types.Content(role="user", parts=current_parts)
        all_contents = history_contents + [current_content]

        response = client.models.generate_content(
            model=model,
            contents=all_contents,
            config=types.GenerateContentConfig(system_instruction=system_prompt)
        )
        reply = response.text

        await save_message(session_id, "model", reply, source="web")
        return {"reply": reply}

    except Exception as e:
        print(f"File chat error: {e}")
        return {"reply": "Sorry, I'm having trouble processing that file right now."}

# --- Public: JD Match ---
JD_MATCH_PROMPT = """Analyze this job description against my profile.
Respond ONLY with valid JSON in exactly this format, no other text outside the JSON:
{
  "job_title": "<concise job title extracted from the JD, e.g. 'Senior Python Developer at Acme Corp'>",
  "match_percent": <integer 0-100>,
  "match_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "assessment": "<2-3 sentences: your honest take on this role — speak in first person as the candidate>"
}"""

@router.post("/api/jd-match")
async def jd_match(file: UploadFile = File(...)):
    """Analyze a JD against profile and return structured match result."""
    try:
        file_bytes = await file.read()
        filename = file.filename.lower()
        profile = await get_profile()
        system_prompt = build_system_prompt(profile)
        ai_settings = await get_ai_settings()
        model = ai_settings.get("active_model")

        if filename.endswith(".pdf"):
            parts = [
                types.Part(inline_data=types.Blob(mime_type="application/pdf", data=base64.b64encode(file_bytes).decode())),
                types.Part(text=JD_MATCH_PROMPT)
            ]
        elif filename.endswith(".docx"):
            extracted_text = extract_docx_text(file_bytes)
            parts = [types.Part(text=f"Job Description:\n\n{extracted_text}\n\n{JD_MATCH_PROMPT}")]
        elif filename.endswith(".txt"):
            text_content = file_bytes.decode("utf-8", errors="ignore")
            parts = [types.Part(text=f"Job Description:\n\n{text_content}\n\n{JD_MATCH_PROMPT}")]
        else:
            raise HTTPException(status_code=400, detail="Only PDF, Word (.docx), and Text (.txt) files are supported")

        response = client.models.generate_content(
            model=model,
            contents=[types.Content(role="user", parts=parts)],
            config=types.GenerateContentConfig(system_instruction=system_prompt)
        )

        raw = response.text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw).rstrip("` \n")
        result = json.loads(raw)

        await notify_jd_upload(file_bytes, file.filename, result)

        return result

    except Exception as e:
        print(f"JD match error: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze job description")

# --- Admin: Login ---
@router.post("/api/admin/login")
async def admin_login(request: LoginRequest, req: Request):
    """Admin login - returns JWT token."""
    ip = req.client.host
    ua = req.headers.get("user-agent", "")
    _check_login_rate(ip)
    if not await authenticate_user(request.username, request.password):
        _record_login_failure(ip)
        await log_admin_login(ip, ua, success=False)
        entry = _login_attempts.get(ip, {})
        remaining = max(0, _MAX_ATTEMPTS - entry.get("count", 0))
        detail = "Invalid username or password."
        if remaining > 0:
            detail += f" {remaining} attempt(s) remaining."
        raise HTTPException(status_code=401, detail=detail)
    _reset_login_attempts(ip)
    await log_admin_login(ip, ua, success=True)
    version = await get_admin_token_version()
    token = create_access_token({"sub": request.username}, token_version=version)
    return {"access_token": token, "token_type": "bearer"}

# --- Admin: Login History ---
@router.get("/api/admin/sessions")
async def get_admin_sessions(username: str = Depends(verify_token)):
    """Return recent admin login history."""
    entries = await get_admin_login_history(limit=30)
    for e in entries:
        if "created_at" in e:
            e["created_at"] = e["created_at"].isoformat()
    return entries

# --- Admin: Change Password ---
class ChangePasswordRequest(BaseModel):
    new_username: Optional[str] = None
    new_password: str

@router.put("/api/admin/password")
async def change_password(data: ChangePasswordRequest, username: str = Depends(verify_token)):
    """Change admin username and/or password, then invalidate all active sessions."""
    new_username = data.new_username or username
    await set_admin_credentials(new_username, hash_password(data.new_password))
    await increment_admin_token_version()
    return {"message": "Credentials updated successfully"}

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

# --- Admin: Analytics ---
@router.get("/api/admin/analytics")
async def get_analytics(username: str = Depends(verify_token)):
    """Get analytics data - requires JWT token."""
    return await get_analytics_data()

# --- Admin: Delete Resume ---
@router.delete("/api/admin/resume")
async def delete_resume(username: str = Depends(verify_token)):
    """Delete resume file."""
    if os.path.exists(RESUME_PATH):
        os.remove(RESUME_PATH)
    return {"message": "Resume deleted successfully"}

# --- Admin: AI Settings ---
class AISettingsUpdate(BaseModel):
    active_model: Optional[str] = None
    available_models: Optional[List[str]] = None

@router.get("/api/admin/ai-settings")
async def get_ai_settings_endpoint(username: str = Depends(verify_token)):
    """Get AI model settings."""
    return await get_ai_settings()

@router.put("/api/admin/ai-settings")
async def update_ai_settings_endpoint(data: AISettingsUpdate, username: str = Depends(verify_token)):
    """Update AI model settings."""
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    await update_ai_settings(updates)
    return {"message": "AI settings updated"}

# ── Job Tracker ────────────────────────────────────────────────────────────────

class JobTrackerLoginRequest(BaseModel):
    username: str
    password: str

class JobTrackerPasswordUpdate(BaseModel):
    password: str

class JobTrackerUserCreate(BaseModel):
    username: str
    password: str

# Public: login
@router.post("/api/jobtracker/login")
async def jobtracker_login(request: JobTrackerLoginRequest):
    user = await get_jobtracker_user(request.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    import bcrypt as _bcrypt
    if not _bcrypt.checkpw(request.password.encode(), user["hashed_password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_jobtracker_token(request.username)
    return {"access_token": token, "token_type": "bearer", "username": request.username}

# Public: get jobs (jobtracker JWT required, own data only)
@router.get("/api/jobtracker/jobs/{jt_username}")
async def jobtracker_get_jobs(jt_username: str, token_user: str = Depends(verify_jobtracker_token)):
    if token_user != jt_username:
        raise HTTPException(status_code=403, detail="Access denied")
    return {"jobs": await get_jobtracker_jobs(jt_username)}

# Public: update jobs (jobtracker JWT required, own data only)
@router.put("/api/jobtracker/jobs/{jt_username}")
async def jobtracker_update_jobs(jt_username: str, jobs: List[Dict[str, Any]], token_user: str = Depends(verify_jobtracker_token)):
    if token_user != jt_username:
        raise HTTPException(status_code=403, detail="Access denied")
    await set_jobtracker_jobs(jt_username, jobs)
    return {"message": "Jobs updated"}

# Admin: list users
@router.get("/api/admin/jobtracker/users")
async def admin_list_jt_users(username: str = Depends(verify_token)):
    return await get_jobtracker_users()

# Admin: create user
@router.post("/api/admin/jobtracker/users")
async def admin_create_jt_user(data: JobTrackerUserCreate, username: str = Depends(verify_token)):
    if await get_jobtracker_user(data.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    await create_jobtracker_user(data.username, hash_password(data.password))
    return {"message": "User created"}

# Admin: change password
@router.put("/api/admin/jobtracker/users/{jt_username}")
async def admin_update_jt_user(jt_username: str, data: JobTrackerPasswordUpdate, username: str = Depends(verify_token)):
    if not await get_jobtracker_user(jt_username):
        raise HTTPException(status_code=404, detail="User not found")
    await update_jobtracker_password(jt_username, hash_password(data.password))
    return {"message": "Password updated"}

# Admin: delete user
@router.delete("/api/admin/jobtracker/users/{jt_username}")
async def admin_delete_jt_user(jt_username: str, username: str = Depends(verify_token)):
    if not await get_jobtracker_user(jt_username):
        raise HTTPException(status_code=404, detail="User not found")
    await delete_jobtracker_user(jt_username)
    return {"message": "User deleted"}

# Admin: upload/replace jobs for a user
@router.put("/api/admin/jobtracker/jobs/{jt_username}")
async def admin_set_jt_jobs(jt_username: str, jobs: List[Dict[str, Any]], username: str = Depends(verify_token)):
    if not await get_jobtracker_user(jt_username):
        raise HTTPException(status_code=404, detail="User not found")
    await set_jobtracker_jobs(jt_username, jobs)
    return {"message": f"Jobs updated for {jt_username}"}

# ── Jobtracker Resume ──────────────────────────────────────────────────────────
JT_RESUME_DIR = "/root/tienmai-bot/resumes"
os.makedirs(JT_RESUME_DIR, exist_ok=True)

@router.get("/api/jobtracker/resume/{jt_username}/check")
async def jt_resume_check(jt_username: str, token_user: str = Depends(verify_jobtracker_token)):
    if token_user != jt_username:
        raise HTTPException(status_code=403)
    return {"exists": os.path.exists(os.path.join(JT_RESUME_DIR, f"{jt_username}.pdf"))}

@router.post("/api/jobtracker/resume/{jt_username}")
async def jt_resume_upload(
    jt_username: str,
    file: UploadFile = File(...),
    do_import: bool = Query(False, alias="import"),
    token_user: str = Depends(verify_jobtracker_token)
):
    if token_user != jt_username:
        raise HTTPException(status_code=403)
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    content = await file.read()
    with open(os.path.join(JT_RESUME_DIR, f"{jt_username}.pdf"), "wb") as f:
        f.write(content)

    if not do_import:
        return {"ok": True, "profile": None}

    try:
        resume_text = extract_pdf_text(content)
        ai_settings = await get_ai_settings()
        model_name = ai_settings.get("active_model")
        prompt = (
            "Extract information from this resume and return ONLY valid JSON, no other text:\n"
            "{\n"
            '  "name": "full name or null",\n'
            '  "title": "current or target job title or null",\n'
            '  "location": "city/country or null",\n'
            '  "email": "email or null",\n'
            '  "phone": "phone number or null",\n'
            '  "linkedin": "linkedin URL or null",\n'
            '  "about": "copy the EXACT summary / profile / about section verbatim from the resume, preserving all details and formatting — do NOT summarize or paraphrase; null if not present",\n'
            '  "skills": ["skill1", "skill2"],\n'
            '  "experiences": [{"role": "job title", "company": "company name", "period": "date range in format \'MMM YYYY · MMM YYYY\' or \'MMM YYYY · Present\', e.g. \'Jan 2022 · Present\' or \'Mar 2020 · Dec 2021\'", "description": "copy the EXACT bullet points / description text verbatim from the resume for this role, preserving all details, numbers, and formatting — do NOT summarize or paraphrase"}],\n'
            '  "educations": [{"degree": "degree name", "school": "school name", "period": "date range in format \'MMM YYYY · MMM YYYY\' or \'MMM YYYY · Present\'"}]\n'
            "}\n\nResume:\n" + resume_text
        )
        response = client.models.generate_content(
            model=model_name,
            contents=[types.Content(role="user", parts=[types.Part(text=prompt)])]
        )
        raw = response.text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw).rstrip("` \n")
        profile_data = {k: v for k, v in json.loads(raw).items() if v is not None}
        return {"ok": True, "profile": profile_data}
    except Exception as e:
        print(f"Resume import error: {e}")
        return {"ok": True, "profile": None}

@router.get("/api/jobtracker/resume/{jt_username}")
async def jt_resume_get(jt_username: str, token_user: str = Depends(verify_jobtracker_token)):
    if token_user != jt_username:
        raise HTTPException(status_code=403)
    path = os.path.join(JT_RESUME_DIR, f"{jt_username}.pdf")
    if not os.path.exists(path):
        raise HTTPException(status_code=404)
    return FileResponse(path, media_type="application/pdf")

@router.delete("/api/jobtracker/resume/{jt_username}")
async def jt_resume_delete(jt_username: str, token_user: str = Depends(verify_jobtracker_token)):
    if token_user != jt_username:
        raise HTTPException(status_code=403)
    path = os.path.join(JT_RESUME_DIR, f"{jt_username}.pdf")
    if os.path.exists(path):
        os.remove(path)
    return {"ok": True}

# ── Jobtracker Profile ─────────────────────────────────────────────────────────
class JtProfileUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    about: Optional[str] = None
    skills: Optional[List[str]] = None
    experiences: Optional[List[dict]] = None
    educations: Optional[List[dict]] = None

@router.get("/api/jobtracker/profile/{jt_username}")
async def jt_get_profile(jt_username: str, token_user: str = Depends(verify_jobtracker_token)):
    if token_user != jt_username:
        raise HTTPException(status_code=403)
    return await get_jt_profile(jt_username)

@router.put("/api/jobtracker/profile/{jt_username}")
async def jt_update_profile(jt_username: str, data: JtProfileUpdate, token_user: str = Depends(verify_jobtracker_token)):
    if token_user != jt_username:
        raise HTTPException(status_code=403)
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if updates:
        await update_jt_profile(jt_username, updates)
    return {"ok": True}

# ── Jobtracker Chatbot ─────────────────────────────────────────────────────────
def build_jt_system_prompt(username: str, jobs: list, resume_exists: bool, profile: dict = None) -> str:
    status_map = {"applied": "Đã apply", "viewed": "Đã xem CV", "downloaded": "Đã tải CV"}
    job_lines = [
        f"{i}. {j.get('title','')} tại {j.get('company','')} | {j.get('loc','')} | {j.get('mode','')} | {j.get('month','')}/{j.get('year','')} | {status_map.get(j.get('status',''), j.get('status',''))} | {'có JD' if j.get('jd') else 'chưa có JD'}"
        for i, j in enumerate(jobs, 1)
    ]
    job_list = "\n".join(job_lines) if job_lines else "Chưa có job nào."

    profile_section = ""
    if profile:
        name = profile.get("name") or username
        parts = []
        if profile.get("title"):      parts.append(f"Vị trí mục tiêu: {profile['title']}")
        if profile.get("location"):   parts.append(f"Địa điểm: {profile['location']}")
        if profile.get("about"):      parts.append(f"Giới thiệu: {profile['about']}")
        if profile.get("skills"):     parts.append(f"Kỹ năng: {', '.join(profile['skills'])}")
        if profile.get("experiences"):
            exps = "\n".join(f"  - {e.get('role','')} tại {e.get('company','')} ({e.get('period','')}): {e.get('description','')}" for e in profile["experiences"])
            parts.append(f"Kinh nghiệm:\n{exps}")
        if profile.get("educations"):
            edus = "\n".join(f"  - {e.get('degree','')} tại {e.get('school','')} ({e.get('period','')})" for e in profile["educations"])
            parts.append(f"Học vấn:\n{edus}")
        if parts:
            profile_section = f"\nHồ sơ cá nhân của {name}:\n" + "\n".join(parts) + "\n"

    resume_note = (
        "Resume của người dùng đã được đính kèm trong cuộc trò chuyện này."
        if resume_exists else
        "Người dùng chưa upload resume. Khi phù hợp, nhắc nhở upload resume (nút '↑ Upload Resume' trên giao diện) để được hỗ trợ tốt hơn."
    )
    return f"""Bạn là AI hỗ trợ tìm kiếm việc làm cho {username}. Nhiệm vụ:
- Phân tích danh sách job đã apply, đưa ra nhận xét và thống kê
- Đánh giá JD mới xem có nên apply không, dựa trên resume và hồ sơ người dùng
- So sánh JD với các job đã apply, tránh trùng lặp
- Tư vấn chiến lược tìm việc, cải thiện hồ sơ
Luôn ưu tiên trả lời bằng tiếng Việt. Thân thiện, thực tế và cụ thể.

NGUYÊN TẮC ĐÁNH GIÁ — BẮT BUỘC TUÂN THỦ:
- Đánh giá công tâm, thẳng thắn. Không xu nịnh, không an ủi sáo rỗng.
- Nếu hồ sơ thiếu kỹ năng hoặc kinh nghiệm so với JD, hãy nói rõ ràng — đây là thiếu sót thật, không che giấu.
- Không kết luận "phù hợp" hay "nên apply" khi có khoảng cách rõ ràng giữa hồ sơ và yêu cầu JD.
- Khi đánh giá mức độ phù hợp, ưu tiên các yêu cầu bắt buộc (must-have) của JD. Thiếu must-have = không phù hợp, dù có nhiều điểm khác tốt.
- Chỉ ra cụ thể điểm mạnh nào thực sự khớp và điểm nào còn thiếu — tránh nhận xét chung chung.
- Nếu được hỏi "có nên apply không", đưa ra khuyến nghị rõ ràng: Nên / Không nên / Cân nhắc — kèm lý do cụ thể.

Khi người dùng hỏi về một job cụ thể mà job đó được đánh dấu "chưa có JD", hãy nhắc họ thêm JD vào job đó (nút "Sửa" → "+ Thêm JD") để được phân tích chi tiết hơn.
{profile_section}
Danh sách {len(jobs)} job đã apply:
{job_list}

{resume_note}"""

def find_relevant_jds(user_message: str, jobs: list) -> list:
    user_lower = user_message.lower()
    result = []
    for job in jobs:
        if not job.get("jd"):
            continue
        company = job.get("company", "").lower()
        title_words = [w for w in job.get("title", "").lower().split() if len(w) > 3]
        if (company and company in user_lower) or any(w in user_lower for w in title_words):
            result.append(job)
    return result[:2]

@router.get("/api/jobtracker/chat/{jt_username}/history")
async def jt_chat_history(jt_username: str, token_user: str = Depends(verify_jobtracker_token)):
    if token_user != jt_username:
        raise HTTPException(status_code=403)
    history = await get_chat_history(f"jt_{jt_username}_main", limit=60)
    messages = [{"role": "assistant" if m["role"] == "model" else m["role"], "content": m["content"]} for m in history]
    return {"messages": messages}

@router.post("/api/jobtracker/chat/{jt_username}")
async def jt_chat(jt_username: str, request: ChatRequest, token_user: str = Depends(verify_jobtracker_token)):
    if token_user != jt_username:
        raise HTTPException(status_code=403)
    session_id = f"jt_{jt_username}_{request.session_id}"
    jobs, profile = await asyncio.gather(get_jobtracker_jobs(jt_username), get_jt_profile(jt_username))
    resume_path = os.path.join(JT_RESUME_DIR, f"{jt_username}.pdf")
    resume_exists = os.path.exists(resume_path)
    system_prompt = build_jt_system_prompt(jt_username, jobs, resume_exists, profile)
    ai_settings = await get_ai_settings()
    model = ai_settings.get("active_model")
    await save_message(session_id, "user", request.message, source="jobtracker")
    history = await get_chat_history(session_id, limit=20)
    contents = []
    if resume_exists:
        resume_text = extract_pdf_text(resume_path)
        contents += [
            types.Content(role="user", parts=[types.Part(text=f"Đây là resume của tôi:\n\n{resume_text}")]),
            types.Content(role="model", parts=[types.Part(text="Đã đọc resume của bạn.")]),
        ]
    relevant_jds = find_relevant_jds(request.message, jobs)
    for msg in history[:-1]:
        contents.append(types.Content(role=msg["role"], parts=[types.Part(text=msg["content"])]))
    current_parts = [types.Part(text=f"[JD: {j.get('company')} - {j.get('title')}]\n{j['jd']}\n") for j in relevant_jds]
    current_parts.append(types.Part(text=request.message))
    contents.append(types.Content(role="user", parts=current_parts))
    response = client.models.generate_content(model=model, contents=contents, config=types.GenerateContentConfig(system_instruction=system_prompt))
    reply = response.text
    await save_message(session_id, "model", reply, source="jobtracker")
    return {"reply": reply}

@router.post("/api/jobtracker/chat/{jt_username}/file")
async def jt_chat_file(
    jt_username: str,
    message: str = Form(default=""),
    session_id: str = Form(default="default"),
    file: UploadFile = File(...),
    token_user: str = Depends(verify_jobtracker_token)
):
    if token_user != jt_username:
        raise HTTPException(status_code=403)
    sid = f"jt_{jt_username}_{session_id}"
    jobs, profile = await asyncio.gather(get_jobtracker_jobs(jt_username), get_jt_profile(jt_username))
    resume_path = os.path.join(JT_RESUME_DIR, f"{jt_username}.pdf")
    resume_exists = os.path.exists(resume_path)
    system_prompt = build_jt_system_prompt(jt_username, jobs, resume_exists, profile)
    ai_settings = await get_ai_settings()
    model = ai_settings.get("active_model")
    file_bytes = await file.read()
    filename = file.filename.lower()
    display = message or "Hãy phân tích JD này và cho biết tôi có nên apply không, dựa trên resume và kinh nghiệm của tôi."
    user_label = f"[File: {file.filename}] {display}"
    await save_message(sid, "user", user_label, source="jobtracker")
    history = await get_chat_history(sid, limit=18)
    contents = []
    if resume_exists:
        resume_text = extract_pdf_text(resume_path)
        contents += [
            types.Content(role="user", parts=[types.Part(text=f"Đây là resume của tôi:\n\n{resume_text}")]),
            types.Content(role="model", parts=[types.Part(text="Đã đọc resume của bạn.")]),
        ]
    for msg in history[:-1]:
        contents.append(types.Content(role=msg["role"], parts=[types.Part(text=msg["content"])]))
    if filename.endswith(".pdf"):
        pdf_text = extract_pdf_text(file_bytes)
        current_parts = [types.Part(text=f"Nội dung file ({file.filename}):\n\n{pdf_text}\n\n{display}")]
    elif filename.endswith(".docx"):
        current_parts = [types.Part(text=f"Nội dung file ({file.filename}):\n\n{extract_docx_text(file_bytes)}\n\n{display}")]
    elif filename.endswith(".txt"):
        current_parts = [types.Part(text=f"Nội dung file ({file.filename}):\n\n{file_bytes.decode('utf-8', errors='ignore')}\n\n{display}")]
    else:
        return {"reply": "Chỉ hỗ trợ file PDF, Word (.docx) và Text (.txt)."}
    contents.append(types.Content(role="user", parts=current_parts))
    response = client.models.generate_content(model=model, contents=contents, config=types.GenerateContentConfig(system_instruction=system_prompt))
    reply = response.text
    await save_message(sid, "model", reply, source="jobtracker")
    return {"reply": reply}
