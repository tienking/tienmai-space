# tienmai.space

Personal portfolio website with AI-powered chatbot, built and self-hosted on a VPS.

🌐 **Live:** [tienmai.space](https://tienmai.space)

---

## Overview

A full-stack personal profile website featuring:

- **Profile page** — About, Skills, Experience, Education, Projects, Certifications, Gallery, Resume
- **JD Match Banner** — Recruiters can upload a job description and get instant AI analysis: match %, matching skills, missing skills, and a first-person assessment
- **AI Chatbot** — RAG-powered assistant that speaks as Tien Mai in first person, answers questions about background and experience, supports file upload (PDF, Word, TXT)
- **Telegram Bot** — Same AI assistant available on Telegram, with owner notifications on new chats and JD uploads
- **Admin Dashboard** — Full CMS to manage all profile content, theme, fonts, gallery, resume, and analytics
- **CI/CD Pipeline** — Auto-deploy on push via GitLab Runner

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
| passlib + bcrypt | Password hashing |
| python-multipart | File upload handling |
| python-docx | Word document parsing |
| python-dotenv | Environment variable management |

### Frontend
| Tool | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool |
| Google Fonts | Typography (Syne, DM Mono, and more) |

### Infrastructure
| Tool | Purpose |
|---|---|
| Hostinger VPS (Ubuntu 22.04) | Server hosting |
| Nginx | Reverse proxy + static file serving |
| Certbot (Let's Encrypt) | SSL certificate |
| MongoDB Atlas | NoSQL database (profile, chat history, visitors) |
| Cloudinary | Image hosting (avatar, gallery) |
| GitLab | Version control + CI/CD |
| GitLab Runner | Auto-deploy on push to main |

### AI
| Tool | Purpose |
|---|---|
| Gemini API (`gemini-2.5-flash-lite`) | LLM for chatbot and JD analysis |
| RAG (system prompt injection) | Profile-aware, first-person chatbot context |
| File parsing (PDF, DOCX, TXT) | JD match analysis + chatbot file upload |

### Domain
| Tool | Purpose |
|---|---|
| Hostinger | Domain registrar (tienmai.space) |

---

## Project Structure

```
tienmai-space/
├── .env                        # Environment variables (not committed)
├── .gitlab-ci.yml              # CI/CD pipeline
├── .gitignore
├── requirements.txt            # Python dependencies
├── main.py                     # FastAPI app + Telegram bot
├── api.py                      # API routes (chat, profile, resume, admin, jd-match)
├── auth.py                     # JWT authentication
├── config.py                   # Config (secrets from .env + app constants)
├── database.py                 # MongoDB operations
├── notifications.py            # Telegram push notifications (new chat, JD upload)
├── uploads/
│   └── resume.pdf              # Resume file (not committed)
└── frontend/
    ├── index.html              # Main page entry
    ├── admin.html              # Admin page entry
    ├── vite.config.js          # Vite multi-page config
    ├── public/
    │   └── favicon.ico
    └── src/
        ├── main.jsx            # Main app entry
        ├── admin.jsx           # Admin app entry
        ├── App.jsx             # Profile page + chatbot
        ├── AdminApp.jsx        # Admin dashboard
        └── index.css           # Global styles
```

---

## Features

### Profile Page (`tienmai.space`)
- Responsive dark/light theme with full customization
- Avatar, name, title, location, social links, Open to Work badge
- Resume button → PDF popup viewer + download
- Sections: About, Skills (grouped), Experience, Education, Projects, Certifications, Gallery
- Certifications: sorted by date, show/hide with expand toggle
- Gallery: 4-column grid + lightbox viewer
- AI chatbot popup (bottom right) with suggested questions, session persistence via localStorage
- Admin shortcut button (top right)
- SEO: meta tags, Open Graph, Twitter Card, sitemap.xml, robots.txt

### JD Match Banner (FOR RECRUITERS)
- Prominent section on profile page for recruiters
- Upload a JD (PDF, DOCX, TXT) via click or drag-and-drop
- AI returns structured analysis: match %, matching skills, missing skills, first-person assessment
- Color-coded result: green ≥50%, red <50%
- Show less / Show full analysis toggle
- Result persists across page refreshes (localStorage)
- All colors configurable from Admin → Theme tab

### AI Chatbot
- Powered by Gemini API (`gemini-2.5-flash-lite`)
- Speaks in first person as Tien Mai — not as a third-party assistant
- RAG via system prompt injection with full profile context
- Responds in the user's language automatically
- Supports file upload: PDF, Word (.docx), Text (.txt)
- Chat history persists in session (localStorage, max 30 messages)
- Suggested quick questions on first open

### Telegram Bot
- Same Gemini AI backend as web chatbot
- Chat history stored in MongoDB per user
- Webhook-based (not polling)
- Owner notifications: new web visitor starts chatting, JD uploaded (file + analysis result sent to owner)

### Admin Dashboard (`tienmai.space/admin`)
- JWT login (username + password)
- Tabs: Basic Info, About, Skills, Experience, Education, Projects, Certifications, Gallery, Resume, Theme, Fonts, Analytics
- Theme editor: 10 presets (5 dark + 5 light), full color picker for all sections including JD Match Banner
- Font selector: 8 display fonts + 6 mono fonts with live preview
- Gallery manager: add/remove/reorder images via Cloudinary URLs
- Resume uploader: upload/replace/delete PDF
- Analytics: total visitors, total questions, visitors chart (last 7 days), recent questions list

### CI/CD
- Push to `main` branch → GitLab pipeline triggers
- Auto: `git pull` → `pip install` → `npm build` → `systemctl restart`

---

## Environment Variables

```env
TELEGRAM_TOKEN=
TELEGRAM_CHAT_ID=        # Your personal Telegram user ID (for notifications)
GEMINI_API_KEY=
MONGODB_URL=
ADMIN_USERNAME=
ADMIN_PASSWORD=
JWT_SECRET=
```

> `WEBHOOK_URL` and `GEMINI_MODEL` are hardcoded in `config.py` (safe to commit, not secrets).

---

## Local Development

```bash
# Clone
git clone git@gitlab.com:tienking/tienmai-space.git
cd tienmai-space

# Backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Fill in your values
uvicorn main:app --reload

# Frontend
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
3. `npm install && npm run build`
4. `systemctl restart tienmai-bot`
