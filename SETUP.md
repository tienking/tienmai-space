# Setup Guide — Build tienmai.space from Scratch

This guide walks through setting up the entire stack from zero: VPS, domain, database, Telegram bot, Gemini API, and CI/CD.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Hostinger VPS](#2-hostinger-vps)
3. [Domain & DNS](#3-domain--dns)
4. [Server: Base Setup](#4-server-base-setup)
5. [MongoDB Atlas](#5-mongodb-atlas)
6. [Telegram Bot](#6-telegram-bot)
7. [Gemini API Key](#7-gemini-api-key)
8. [Cloudinary](#8-cloudinary)
9. [GitLab Repository](#9-gitlab-repository)
10. [Deploy the App](#10-deploy-the-app)
11. [Nginx Configuration](#11-nginx-configuration)
12. [SSL Certificate](#12-ssl-certificate)
13. [Systemd Service](#13-systemd-service)
14. [GitLab CI/CD](#14-gitlab-cicd)
15. [Seed Initial Profile Data](#15-seed-initial-profile-data)
16. [Verify Everything Works](#16-verify-everything-works)

---

## 1. Prerequisites

Accounts to create before starting:

| Service | URL | Purpose |
|---------|-----|---------|
| Hostinger | hostinger.com | VPS + domain |
| MongoDB Atlas | mongodb.com/atlas | Database |
| Telegram | telegram.org | Bot for notifications |
| Google AI Studio | aistudio.google.com | Gemini API key |
| Cloudinary | cloudinary.com | Image hosting |
| GitLab | gitlab.com | Version control + CI/CD |

---

## 2. Hostinger VPS

### 2.1 Purchase a VPS

1. Go to **hostinger.com → VPS Hosting**
2. Choose a plan (KVM 2 — 2 vCPU, 8GB RAM is comfortable for this stack)
3. Select **Ubuntu 22.04** as the OS
4. Complete purchase

### 2.2 First SSH Login

After purchase, Hostinger will email your root password and server IP.

```bash
ssh root@<YOUR_SERVER_IP>
```

Change root password on first login when prompted.

### 2.3 Create a Non-Root User (Optional but recommended)

```bash
adduser deploy
usermod -aG sudo deploy
```

For this guide we'll continue as root for simplicity.

---

## 3. Domain & DNS

### 3.1 Purchase Domain on Hostinger

1. **Hostinger → Domains** → search and buy your domain (e.g. `yourname.space`)

### 3.2 Point Domain to VPS

1. Go to **Hostinger → Domains → DNS / Nameservers**
2. Add an **A record**:
   - Host: `@`
   - Points to: `<YOUR_SERVER_IP>`
   - TTL: 3600
3. Add another **A record**:
   - Host: `www`
   - Points to: `<YOUR_SERVER_IP>`

DNS propagation takes up to 24 hours, usually under 30 minutes.

---

## 4. Server: Base Setup

### 4.1 Update System

```bash
apt update && apt upgrade -y
```

### 4.2 Install Required Packages

```bash
apt install -y python3.12 python3.12-venv python3-pip nginx certbot python3-certbot-nginx git curl
```

### 4.3 Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Verify:

```bash
node -v   # v20.x.x
npm -v    # 10.x.x
python3 --version  # Python 3.12.x
```

---

## 5. MongoDB Atlas

### 5.1 Create a Free Cluster

1. Sign in to **mongodb.com/atlas**
2. **Create a New Project** → name it (e.g. `tienmai`)
3. **Build a Database** → choose **M0 Free tier** → select a region → Create

### 5.2 Create a Database User

1. Go to **Security → Database Access → Add New Database User**
2. Authentication: **Password**
3. Username: `tienmai_user` (or any name)
4. Password: generate a strong one, **save it**
5. Role: **Atlas admin** (or ReadWriteAnyDatabase)
6. Click **Add User**

### 5.3 Allow Network Access

1. Go to **Security → Network Access → Add IP Address**
2. Click **Allow Access from Anywhere** (0.0.0.0/0) for simplicity
   - For production, add only your VPS IP instead
3. Confirm

### 5.4 Get Connection String

1. Go to **Database → Connect → Drivers**
2. Select **Python** / **Motor (async)**
3. Copy the connection string — it looks like:
   ```
   mongodb+srv://tienmai_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

---

## 6. Telegram Bot

### 6.1 Create a Bot

1. Open Telegram → search for **@BotFather**
2. Send `/newbot`
3. Choose a name (e.g. `Tien Mai Bot`)
4. Choose a username ending in `bot` (e.g. `tienmai_bot`)
5. BotFather will reply with your **bot token** — save it

### 6.2 Get Your Personal Chat ID

1. Search for **@userinfobot** on Telegram
2. Send `/start`
3. It will reply with your **Id** — save it (this is your `TELEGRAM_CHAT_ID`)

---

## 7. Gemini API Key

1. Go to **aistudio.google.com**
2. Click **Get API key → Create API key**
3. Copy and save the key

---

## 8. Cloudinary

### 8.1 Create Account

1. Sign up at **cloudinary.com** (free tier is sufficient)
2. After login, go to **Dashboard**
3. Note your **Cloud Name**

### 8.2 Upload Images

For avatar and gallery images:
1. Go to **Media Library → Upload**
2. Upload your images
3. Click on an image → Copy the **URL** (starts with `https://res.cloudinary.com/...`)

These URLs will be used when filling in profile data.

---

## 9. GitLab Repository

### 9.1 Create Repository

1. Go to **gitlab.com → New project → Create blank project**
2. Name it (e.g. `tienmai-space`)
3. Set visibility to **Private**

### 9.2 Setup SSH Key on VPS

```bash
ssh-keygen -t ed25519 -C "deploy@yourserver" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

Copy the output.

1. Go to **GitLab → Preferences → SSH Keys**
2. Paste the public key → Add key

### 9.3 Clone or Push Your Code

If starting from this project:
```bash
cd /root
git clone git@gitlab.com:yourusername/tienmai-space.git tienmai-bot
cd tienmai-bot
```

---

## 10. Deploy the App

### 10.1 Create Virtual Environment

```bash
cd /root/tienmai-bot
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 10.2 Create .env File

```bash
nano /root/tienmai-bot/.env
```

Fill in:

```env
TELEGRAM_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_personal_telegram_id
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URL=mongodb+srv://tienmai_user:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose_a_strong_password
JWT_SECRET=generate_a_random_64char_string
```

To generate a JWT secret:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 10.3 Build Frontend

```bash
cd /root/tienmai-bot/frontend
npm install
npm run build
```

This creates `frontend/dist/` with the compiled static files.

### 10.4 Create Uploads Directory

```bash
mkdir -p /root/tienmai-bot/uploads
```

---

## 11. Nginx Configuration

### 11.1 Create Config File

```bash
nano /etc/nginx/sites-available/tienmai
```

Paste:

```nginx
server {
    listen 80;
    server_name yourdomain.space www.yourdomain.space;

    client_max_body_size 20m;

    # Serve React frontend (main app)
    location / {
        root /root/tienmai-bot/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Serve Admin page
    location /admin {
        root /root/tienmai-bot/frontend/dist;
        try_files $uri $uri/ /admin.html;
    }

    # Proxy API and webhook to FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /webhook {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 11.2 Enable Site

```bash
ln -s /etc/nginx/sites-available/tienmai /etc/nginx/sites-enabled/tienmai
nginx -t
systemctl reload nginx
```

---

## 12. SSL Certificate

Run Certbot (domain must already be pointing to this server's IP):

```bash
certbot --nginx -d yourdomain.space -d www.yourdomain.space
```

Follow the prompts:
- Enter email
- Agree to terms
- Choose **redirect HTTP to HTTPS**

Certbot will automatically edit your Nginx config and add HTTPS.

Verify auto-renewal works:
```bash
certbot renew --dry-run
```

---

## 13. Systemd Service

### 13.1 Create Service File

```bash
nano /etc/systemd/system/tienmai-bot.service
```

Paste:

```ini
[Unit]
Description=Tienmai Telegram Bot
After=network.target

[Service]
User=root
WorkingDirectory=/root/tienmai-bot
ExecStart=/root/tienmai-bot/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5
EnvironmentFile=/root/tienmai-bot/.env

[Install]
WantedBy=multi-user.target
```

### 13.2 Enable and Start

```bash
systemctl daemon-reload
systemctl enable tienmai-bot
systemctl start tienmai-bot
systemctl status tienmai-bot
```

You should see `active (running)`.

### 13.3 Check Logs

```bash
journalctl -u tienmai-bot -f
```

---

## 14. GitLab CI/CD

### 14.1 Install GitLab Runner on VPS

```bash
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | bash
apt install gitlab-runner
```

### 14.2 Register Runner

```bash
gitlab-runner register
```

You'll be asked:
- **GitLab instance URL**: `https://gitlab.com`
- **Registration token**: Go to **GitLab → Project → Settings → CI/CD → Runners → New project runner** → copy token
- **Runner name**: anything (e.g. `vps-runner`)
- **Executor**: `shell`

### 14.3 Give Runner Permissions

```bash
usermod -aG sudo gitlab-runner
echo "gitlab-runner ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
```

### 14.4 Create .gitlab-ci.yml

In the project root:

```yaml
stages:
  - deploy

deploy:
  stage: deploy
  only:
    - main
  script:
    - cd /root/tienmai-bot
    - git pull origin main
    - source venv/bin/activate
    - pip install -r requirements.txt --quiet
    - cd frontend && npm install --silent && npm run build
    - cd ..
    - sudo systemctl restart tienmai-bot
```

Commit and push — every push to `main` will now auto-deploy.

---

## 15. Seed Initial Profile Data

The profile is stored in MongoDB and must be seeded once. Run this on the VPS:

```bash
cd /root/tienmai-bot
source venv/bin/activate
python3 - <<'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
db = client["tienmai"]

profile = {
    "name": "Your Name",
    "title": "Your Title",
    "location": "City, Country",
    "email": "you@email.com",
    "github": "https://github.com/yourusername",
    "gitlab": "",
    "linkedin": "https://linkedin.com/in/yourusername",
    "about": "Write a short bio about yourself here.",
    "avatar": "https://res.cloudinary.com/your-cloud/image/upload/your-avatar.jpg",
    "openToWork": True,
    "skills": [
        {"group": "Languages", "items": ["Python", "JavaScript"]},
        {"group": "Frameworks", "items": ["FastAPI", "React"]},
    ],
    "experiences": [
        {
            "role": "Software Engineer",
            "company": "Company Name",
            "period": "Jan 2023 · Present",
            "description": "What you did here."
        }
    ],
    "educations": [
        {
            "school": "University Name",
            "degree": "Bachelor of Computer Science",
            "period": "2019 – 2023"
        }
    ],
    "projects": [
        {
            "title": "Project Name",
            "tag": "Personal",
            "description": "What this project does.",
            "link": "https://github.com/..."
        }
    ],
    "certifications": [],
    "gallery": [],
    "theme": {},
    "fonts": {}
}

async def seed():
    existing = await db["profile"].find_one({})
    if existing:
        print("Profile already exists — skipping seed.")
    else:
        await db["profile"].insert_one(profile)
        print("Profile seeded successfully.")

asyncio.run(seed())
EOF
```

After seeding, use the Admin dashboard at `yourdomain.space/admin` to edit all fields through the UI.

---

## 16. Verify Everything Works

Run through this checklist:

```
□ https://yourdomain.space          → Profile page loads
□ https://yourdomain.space/admin    → Admin login page loads
□ Admin login works (username/password from .env)
□ Profile data shows on the page
□ Chatbot opens and responds
□ Resume upload works in Admin
□ JD upload (FOR RECRUITERS section) returns analysis
□ Telegram bot responds when messaged
□ Telegram notification received when chatbot is used on website
□ Telegram notification received when JD is uploaded
□ Push to GitLab main → auto-deploys
```

### Useful Commands

```bash
# View live logs
journalctl -u tienmai-bot -f

# Restart app
systemctl restart tienmai-bot

# Rebuild frontend manually
cd /root/tienmai-bot/frontend && npm run build

# Reload Nginx
systemctl reload nginx

# Check Nginx config
nginx -t

# Check SSL expiry
certbot certificates
```

---

## Summary of Services

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Hostinger VPS | No (~$5-10/mo) | KVM 1 is enough to start |
| Hostinger Domain | No (~$2-15/yr) | `.space` domains are cheap |
| MongoDB Atlas | Yes (M0, 512MB) | Sufficient for personal use |
| Gemini API | Yes (generous limits) | Upgrade if traffic grows |
| Cloudinary | Yes (25GB storage) | More than enough |
| GitLab | Yes | Unlimited private repos |
| Telegram Bot | Yes | Always free |
