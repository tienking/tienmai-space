from dotenv import load_dotenv
import os

load_dotenv()

# --- Secrets (stored in .env, never commit) ---
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MONGODB_URL = os.getenv("MONGODB_URL")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
JWT_SECRET = os.getenv("JWT_SECRET")

# --- App config (edit here, safe to commit) ---
WEBHOOK_URL = "https://tienmai.space/webhook"
GEMINI_MODEL = "gemini-2.5-flash-lite"
