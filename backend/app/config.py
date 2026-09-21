import os
from pathlib import Path

from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

load_dotenv(ENV_PATH)


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///kaizen.db")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
SQL_ECHO = os.getenv("SQL_ECHO", "false").lower() == "true"

SESSION_COOKIE_NAME = os.getenv("SESSION_COOKIE_NAME", "kaizen_session")
SESSION_DAYS = int(os.getenv("SESSION_DAYS", "7"))
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "true").lower() == "true"
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax")
