import os
from pathlib import Path

from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

load_dotenv(ENV_PATH)


def normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


STATIC_DIR = os.getenv("STATIC_DIR", "")
DATABASE_URL = normalize_database_url(os.getenv("DATABASE_URL", ""))

if not DATABASE_URL:
    if STATIC_DIR:
        raise RuntimeError(
            "Falta DATABASE_URL. Sirviendo el frontend compilado se da por hecho "
            "que esto es un despliegue, y sin esa variable los datos irian a un "
            "SQLite dentro del contenedor que se borra en cada redespliegue."
        )
    DATABASE_URL = "sqlite:///kaizen.db"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
SQL_ECHO = os.getenv("SQL_ECHO", "false").lower() == "true"

SESSION_COOKIE_NAME = os.getenv("SESSION_COOKIE_NAME", "kaizen_session")
SESSION_DAYS = int(os.getenv("SESSION_DAYS", "7"))
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "true").lower() == "true"
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax")

CSRF_COOKIE_NAME = os.getenv("CSRF_COOKIE_NAME", "kaizen_csrf")
CSRF_HEADER_NAME = "X-CSRF-Token"
CSRF_EXEMPT_PATHS = frozenset({"/auth/register", "/auth/login", "/auth/logout"})
