from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URL
from datetime import datetime, timedelta

# --- Connection ---
client = AsyncIOMotorClient(MONGODB_URL)
db = client["tienmai"]

# --- Collections ---
chat_collection = db["chat_history"]
visitor_collection = db["visitors"]
profile_collection = db["profile"]

# --- Profile ---
async def get_profile():
    """Retrieve profile from database."""
    profile = await profile_collection.find_one({}, {"_id": 0})
    return profile

async def update_profile(updates: dict):
    """Update profile fields in database."""
    await profile_collection.update_one({}, {"$set": updates})

# --- Chat History ---
async def save_message(session_id: str, role: str, content: str, source: str = "web"):
    """Save a single message to the database."""
    await chat_collection.insert_one({
        "session_id": session_id,
        "role": role,
        "content": content,
        "source": source,  # "web" or "telegram"
        "created_at": datetime.utcnow()
    })

async def get_chat_history(session_id: str, limit: int = 20):
    """Retrieve chat history for a given session."""
    cursor = chat_collection.find(
        {"session_id": session_id},
        sort=[("created_at", 1)]
    ).limit(limit)
    return await cursor.to_list(length=limit)

# --- Visitors ---
async def log_visitor(session_id: str):
    """Record a visitor session."""
    await visitor_collection.update_one(
        {"session_id": session_id},
        {
            "$set": {"last_seen": datetime.utcnow()},
            "$setOnInsert": {"first_seen": datetime.utcnow()}
        },
        upsert=True
    )

async def get_analytics_data():
    """Aggregate analytics data for admin dashboard."""
    total_visitors = await visitor_collection.count_documents({})
    total_messages = await chat_collection.count_documents({"role": "user", "session_id": {"$exists": True}})

    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    day_cursor = visitor_collection.aggregate([
        {"$match": {"first_seen": {"$gte": seven_days_ago}}},
        {"$group": {"_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$first_seen"}}, "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ])
    visitors_by_day_raw = await day_cursor.to_list(length=None)

    q_cursor = chat_collection.find(
        {"role": "user", "session_id": {"$exists": True}},
        {"_id": 0, "content": 1, "created_at": 1, "source": 1}
    ).sort([("created_at", -1)]).limit(20)
    recent_questions = await q_cursor.to_list(length=20)

    return {
        "total_visitors": total_visitors,
        "total_messages": total_messages,
        "visitors_by_day": [{"date": d["_id"], "count": d["count"]} for d in visitors_by_day_raw],
        "recent_questions": [
            {
                "content": q["content"],
                "created_at": q["created_at"].isoformat() if q.get("created_at") else "",
                "source": q.get("source", "web"),
            }
            for q in recent_questions
        ],
    }
