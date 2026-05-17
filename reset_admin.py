"""
Run on the VPS to diagnose and reset admin credentials.
Usage:
  python reset_admin.py              # show current admin username
  python reset_admin.py <new_pass>   # reset password (username stays the same)
  python reset_admin.py <user> <pass># reset both username and password
"""
import asyncio
import sys
from database import settings_collection
import bcrypt


async def main():
    doc = await settings_collection.find_one({"type": "admin"}, {"_id": 0})

    if not doc:
        print("No admin credentials found in DB.")
    else:
        print(f"Current admin username: {doc.get('username')}")
        print(f"Hash stored: {'yes' if doc.get('hashed_password') else 'NO — missing!'}")

    args = sys.argv[1:]
    if not args:
        return

    if len(args) == 1:
        username = doc.get("username") if doc else "admin"
        new_pass = args[0]
    else:
        username, new_pass = args[0], args[1]

    hashed = bcrypt.hashpw(new_pass.encode(), bcrypt.gensalt()).decode()
    await settings_collection.update_one(
        {"type": "admin"},
        {"$set": {"username": username, "hashed_password": hashed}},
        upsert=True
    )
    print(f"Done — admin credentials set: username='{username}'")


asyncio.run(main())
