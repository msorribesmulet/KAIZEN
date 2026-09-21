from secrets import compare_digest

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import (
    CSRF_COOKIE_NAME,
    CSRF_EXEMPT_PATHS,
    CSRF_HEADER_NAME,
    FRONTEND_URL,
    SESSION_COOKIE_NAME,
)
from app.database import create_db_and_tables
from app.models.food import Food
from app.routers import food
from app.models.log import Log
from app.routers import log
from app.routers import summary
from app.models.profile import Profile
from app.routers import profile
from app.models.user import User, UserSession
from app.routers import auth

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SAFE_METHODS = frozenset({"GET", "HEAD", "OPTIONS"})


@app.middleware("http")
async def csrf_protection(request: Request, call_next):
    if request.method in SAFE_METHODS or request.url.path in CSRF_EXEMPT_PATHS:
        return await call_next(request)

    if SESSION_COOKIE_NAME not in request.cookies:
        return await call_next(request)

    sent = request.headers.get(CSRF_HEADER_NAME)
    stored = request.cookies.get(CSRF_COOKIE_NAME)
    if not sent or not stored or not compare_digest(sent, stored):
        return JSONResponse(status_code=403, content={"detail": "CSRF token invalid"})

    return await call_next(request)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    errors = [
        {key: value for key, value in error.items() if key != "input"}
        for error in exc.errors()
    ]
    return JSONResponse(status_code=422, content=jsonable_encoder({"detail": errors}))


app.include_router(auth.router)
app.include_router(food.router)
app.include_router(log.router)
app.include_router(summary.router)
app.include_router(profile.router)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
