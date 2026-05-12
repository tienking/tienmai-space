import io
from telegram import Bot
from config import TELEGRAM_TOKEN, TELEGRAM_CHAT_ID


async def _bot():
    return Bot(token=TELEGRAM_TOKEN)


async def notify_new_chat(first_message: str):
    """Notify owner when a new web visitor sends their first message."""
    if not TELEGRAM_CHAT_ID or not TELEGRAM_TOKEN:
        return
    try:
        bot = await _bot()
        text = f"💬 New visitor on tienmai.space!\n\n{first_message[:300]}"
        await bot.send_message(chat_id=int(TELEGRAM_CHAT_ID), text=text)
    except Exception as e:
        print(f"Telegram notify error: {e}")


async def notify_jd_upload(file_bytes: bytes, filename: str, result: dict):
    """Send JD file and match analysis to owner."""
    if not TELEGRAM_CHAT_ID or not TELEGRAM_TOKEN:
        return
    try:
        bot = await _bot()
        chat_id = int(TELEGRAM_CHAT_ID)

        await bot.send_document(
            chat_id=chat_id,
            document=io.BytesIO(file_bytes),
            filename=filename,
            caption="📄 A recruiter just uploaded a JD on tienmai.space"
        )

        pct = result.get("match_percent", 0)
        match_emoji = "🟢" if pct >= 50 else "🔴"
        matching = ", ".join(result.get("match_skills") or []) or "—"
        missing = ", ".join(result.get("missing_skills") or []) or "None"
        assessment = result.get("assessment", "")

        text = (
            f"{match_emoji} *JD Match: {pct}%*\n\n"
            f"✅ *Matching:* {matching}\n\n"
            f"❌ *Missing:* {missing}\n\n"
            f"💭 {assessment}"
        )
        await bot.send_message(chat_id=chat_id, text=text, parse_mode="Markdown")
    except Exception as e:
        print(f"Telegram JD notify error: {e}")
