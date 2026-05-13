"""
Run once on VPS to migrate admin credentials from .env into MongoDB.

Usage:
    source venv/bin/activate
    python seed_admin.py
"""
import asyncio
import bcrypt
from database import set_admin_credentials

USERNAME = input("Admin username: ")
PASSWORD = input("Admin password: ")

async def main():
    hashed = bcrypt.hashpw(PASSWORD.encode(), bcrypt.gensalt()).decode()
    await set_admin_credentials(USERNAME, hashed)
    print("Done — credentials saved to MongoDB.")

asyncio.run(main())
