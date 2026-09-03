import os
from pathlib import Path

from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

load_dotenv(ENV_PATH)


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///kaizen.db")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
