# tienmai.space

Personal portfolio website with AI-powered chatbot and Job Tracker, self-hosted on a VPS.

🌐 **Live:** [tienmai.space](https://tienmai.space)

---

## Overview

A full-stack personal profile website featuring:

- **Portfolio page** — About, Skills, Experience, Education, Projects, Certifications, Gallery, Resume
- **JD Match Banner** — Recruiters upload a job description and get instant AI analysis: match %, skills breakdown, first-person assessment
- **AI Chatbot** — Gemini-powered assistant that speaks as Tien Mai in first person; supports file upload
- **Telegram Bot** — Same AI assistant on Telegram; pushes owner notifications on new chats and JD uploads
- **Job Tracker** — Private authenticated app for tracking job applications: pipeline board, profile editor, AI resume extraction, JD analysis chatbot
- **Admin Dashboard** — Full CMS for profile content, theme, fonts, analytics, and account settings

---

## Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| Python 3.12 | Runtime |
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| Motor | Async MongoDB driver |
| python-telegram-bot | Telegram bot integration |
| google-genai | Gemini AI API client |
| python-jose | JWT authentication |
| bcrypt | Password hashing |
| pdfplumber | PDF text extraction |
| python-docx | Word document parsing |
| python-multipart | File upload handling |
| python-dotenv | Environment variable management |

### Frontend
| Tool | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool + multi-page config |
| Google Fonts | Typography (Syne, DM Mono, and more) |

### Infrastructure
| Tool | Purpose |
|---|---|
| Hostinger VPS (Ubuntu 22.04) | Server hosting |
| Nginx | Reverse proxy + static file serving |
| Certbot (Let's Encrypt) | SSL certificate |
| MongoDB Atlas | NoSQL database |
| Cloudinary | Image hosting (avatar, gallery) |
| GitLab | Version control + CI/CD |
| GitLab Runner | Auto-deploy on push to main |

### AI
| Tool | Purpose |
|---|---|
| Gemini API | LLM for chatbot, JD analysis, resume extraction |
| RAG (system prompt injection) | Profile-aware first-person chatbot context |
| File parsing (PDF, DOCX, TXT) | JD match + chatbot file upload |

---

## Project Structure

```
tienmai-space/
├── .env                          # Secrets (not committed)
├── .gitlab-ci.yml                # CI/CD pipeline
├── .gitignore
├── requirements.txt              # Python dependencies
├── main.py                       # FastAPI app entry + Telegram bot
├── api.py                        # All API routes
├── auth.py                       # JWT auth (admin + Job Tracker)
├── config.py                     # Config (secrets from .env + app constants)
├── database.py                   # MongoDB operations
├── notifications.py              # Telegram push notifications
├── tienmai-api.service           # Systemd service unit file
├── nginx.conf                    # Nginx config reference
├── seed_admin.py                 # One-time: seed initial admin credentials
├── seed_jobtracker.py            # One-time: seed a Job Tracker test user
├── uploads/
│   └── resume.pdf                # Portfolio resume (not committed)
├── resumes/
│   └── {username}.pdf            # Job Tracker user resumes (not committed)
└── frontend/
    ├── index.html                # Portfolio page entry
    ├── admin.html                # Admin page entry
    ├── jobtracker.html           # Job Tracker page entry
    ├── vite.config.js            # Vite multi-page config
    └── src/
        ├── main.jsx              # Portfolio app entry
        ├── admin.jsx             # Admin app entry
        ├── jobtracker.jsx        # Job Tracker app entry
        ├── App.jsx               # Portfolio page + chatbot
        ├── AdminApp.jsx          # Admin dashboard
        ├── JobTrackerApp.jsx     # Job Tracker app
        └── index.css             # Global styles
```

---

## Features

### Portfolio Page (`tienmai.space`)
- Responsive dark/light theme with full admin customization
- Avatar, name, title, location, social links, Open to Work badge
- Resume button → PDF popup viewer + download
- Sections: About, Skills (grouped), Experience, Education, Projects, Certifications, Gallery
- Certifications: sorted by date, expandable list
- Gallery: 4-column grid with lightbox viewer
- AI chatbot popup (bottom right) — suggested questions, session persistence, new conversation clears UI and MongoDB history

### JD Match Banner
- Upload a JD (PDF, DOCX, TXT) via click or drag-and-drop
- AI returns: match %, matching skills, missing skills, first-person assessment
- Color-coded result (green ≥50%, red <50%); result persists across page refreshes via localStorage
- All colors configurable from Admin → Theme

### AI Chatbot
- Speaks in first person as Tien Mai — not as a third-party AI assistant
- RAG via system prompt injection with full profile context (including open-to-work status)
- Responds in the user's language automatically
- Supports file upload: PDF, Word (.docx), Text (.txt)
- New conversation button clears UI and deletes that session's history from MongoDB

### Telegram Bot
- Same Gemini backend as the web chatbot, chat history stored in MongoDB per user
- Webhook-based (not polling)
- Owner notifications: new web visitor starts chatting; JD uploaded (file + full analysis forwarded to owner via Telegram)

### Job Tracker (`tienmai.space/jobtracker`)
- Private app — separate JWT-authenticated user accounts (no relation to admin account)
- **Tracker board** — Kanban-style pipeline: Wishlist / Applied / Interviewing / Offer / Rejected; add notes and job descriptions per card
- **Profile tab** — Name, title, contact info, skills, work experience (month/year dropdowns), education
- **AI Resume extraction** — Upload PDF/DOCX resume → AI auto-fills all profile fields; preserves exact summary text verbatim
- **AI Chatbot** — Reads entire resume + all JDs; evaluates fit honestly (not flattering), calls out gaps, recommends Nên apply / Không nên / Cân nhắc
- New conversation button clears UI and deletes MongoDB history for that user

### Admin Dashboard (`tienmai.space/admin`)
- JWT login with brute force protection: 5 failed attempts → 5-minute lockout (countdown shown)
- **Tabs:** Basic Info, About, Skills, Experience, Education, Projects, Certifications, Gallery, Resume, Theme, Fonts, Analytics, Settings
- **Theme editor:** 10 presets (5 dark + 5 light), full color picker for every section including JD Match Banner
- **Font selector:** 8 display fonts + 6 mono fonts with live preview
- **Analytics:** total visitors, total messages, 7-day visitor chart, recent questions list
- **Settings tab:** change username and password (verifies current password first, invalidates all active sessions on change), login history (IP, device, success/fail per attempt)

---

## Environment Variables

```env
TELEGRAM_TOKEN=
TELEGRAM_CHAT_ID=        # Your personal Telegram user ID (for owner notifications)
GEMINI_API_KEY=
MONGODB_URL=
JWT_SECRET=              # Random 64-char string — used for admin and Job Tracker tokens
```

> Admin credentials are stored in MongoDB, not in `.env`. Set them once via `seed_admin.py` on first deploy, then change them through Admin → Settings tab.

---

## Local Development

```bash
# Backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill in your values
uvicorn main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

---

## Deployment

Hosted on **Hostinger VPS** with auto-deploy via GitLab CI/CD.

Every push to `main` triggers:
1. `git pull origin main`
2. `pip install -r requirements.txt`
3. `cd frontend && npm install && npm run build`
4. `systemctl restart tienmai-api`

See [SETUP.md](SETUP.md) for full server setup instructions from scratch.
