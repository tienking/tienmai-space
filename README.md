# tienmai.space

Personal portfolio website with AI-powered chatbot, built and self-hosted on a VPS.

🌐 **Live:** [tienmai.space](https://tienmai.space)

---

## Overview

A full-stack personal profile website featuring:

- **Profile page** — About, Skills, Experience, Education, Projects, Gallery, Resume
- **AI Chatbot** — RAG-powered assistant that answers questions about Tien based on profile data, supports file upload (PDF, Word, TXT) for JD analysis
- **Telegram Bot** — Same AI assistant available on Telegram
- **Admin Dashboard** — Full CMS to manage profile content, theme, fonts, gallery, and resume
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
| React 18 | UI framework |
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
| Gemini API | LLM for chatbot responses |
| RAG (system prompt injection) | Profile-aware chatbot context |
| File parsing (PDF, DOCX, TXT) | JD analysis via file upload |

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
├── api.py                      # API routes (chat, profile, resume, admin)
├── auth.py                     # JWT authentication
├── config.py                   # Config from .env
├── database.py                 # MongoDB operations
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
- Responsive dark/light theme
- Avatar, name, title, location, social links
- Resume button → PDF popup viewer + download
- Sections: About, Skills, Experience, Education, Projects, Gallery
- Gallery with 4-column grid + lightbox viewer
- AI chatbot popup (bottom right)
- Admin shortcut button (top right)

### AI Chatbot
- Powered by Gemini API
- RAG via system prompt injection with full profile context
- Responds in the user's language automatically
- Supports file upload: PDF, Word (.docx), Text (.txt)
- JD analysis: evaluates job descriptions against profile
- Chat history persists within session

### Telegram Bot
- Same Gemini AI backend
- Chat history stored in MongoDB per user
- Webhook-based (not polling)

### Admin Dashboard (`tienmai.space/admin`)
- JWT login (username + password)
- Tabs: Basic Info, About, Skills, Experience, Education, Projects, Gallery, Resume, Theme, Fonts
- Theme editor: 10 presets (5 dark + 5 light), full color picker for backgrounds, text, section labels
- Font selector: 8 display fonts + 6 mono fonts with live preview
- Gallery manager: add/remove/reorder images via Cloudinary URLs
- Resume uploader: upload/replace/delete PDF

### CI/CD
- Push to `main` branch → GitLab pipeline triggers
- Auto: `git pull` → `pip install` → `npm build` → `systemctl restart`

---

## Environment Variables

```env
TELEGRAM_TOKEN=
GEMINI_API_KEY=
WEBHOOK_URL=https://tienmai.space/webhook
GEMINI_MODEL=gemini-3.1-flash-lite-preview
MONGODB_URL=
ADMIN_USERNAME=
ADMIN_PASSWORD=
JWT_SECRET=
```

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
