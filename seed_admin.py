"""
Run once on VPS to migrate admin credentials from .env into MongoDB.

Usage:
    source venv/bin/activate
    python seed_admin.py
"""
import asyncio
from passlib.context import CryptContext
from database import set_admin_credentials

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

USERNAME = input("Admin username: ")
PASSWORD = input("Admin password: ")

async def main():
    hashed = pwd_context.hash(PASSWORD)
    await set_admin_credentials(USERNAME, hashed)
    print("Done — credentials saved to MongoDB.")

asyncio.run(main())
