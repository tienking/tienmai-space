from fastapi import FastAPI, Request
from telegram import Update
from telegram.ext import Application, MessageHandler, filters, ContextTypes
from google import genai
from google.genai import types
from config import TELEGRAM_TOKEN, GEMINI_API_KEY, WEBHOOK_URL
from database import save_message, get_chat_history, get_ai_settings
from api import router

# --- Gemini Client ---
client = genai.Client(api_key=GEMINI_API_KEY)

# --- Telegram & FastAPI Setup ---
app = FastAPI()
app.include_router(router)
bot_app = Application.builder().token(TELEGRAM_TOKEN).build()

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle incoming Telegram messages and save to MongoDB."""
    if not update.message or not update.message.text:
        return

    user_id = str(update.effective_user.id)
    user_text = update.message.text
    session_id = f"telegram_{user_id}"

    try:
        # Save user message to DB
        await save_message(session_id, "user", user_text, source="telegram")

        # Retrieve history from DB
        history = await get_chat_history(session_id, limit=20)
        contents = [
            types.Content(role=msg["role"], parts=[types.Part(text=msg["content"])])
            for msg in history
        ]

        # Call Gemini
        ai_settings = await get_ai_settings()
        model = ai_settings.get("active_model")
        response = client.models.generate_content(
            model=model,
            contents=contents
        )
        reply = response.text

        # Save model reply to DB
        await save_message(session_id, "model", reply, source="telegram")

        await update.message.reply_text(reply)

    except Exception as e:
        print(f"Telegram error: {e}")
        await update.message.reply_text("Sorry, I'm having trouble processing that right now.")

# Register message handler (excludes commands)
bot_app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

@app.on_event("startup")
async def startup():
    """Initialize bot and set webhook on startup."""
    await bot_app.initialize()
    await bot_app.bot.set_webhook(WEBHOOK_URL)
    print(f"Telegram bot started. Webhook set to: {WEBHOOK_URL}")

@app.on_event("shutdown")
async def shutdown():
    """Clean up on shutdown."""
    await bot_app.shutdown()

@app.post("/webhook")
async def webhook(request: Request):
    """Endpoint for Telegram to post updates via webhook."""
    try:
        data = await request.json()
        update = Update.de_json(data, bot_app.bot)
        await bot_app.process_update(update)
    except Exception as e:
        print(f"Webhook processing error: {e}")
    return {"ok": True}
