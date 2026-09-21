from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import FRONTEND_URL
from app.database import create_db_and_tables
from app.models.food import Food
from app.routers import food
from app.models.log import Log
from app.routers import log
from app.routers import summary
from app.models.profile import Profile
from app.routers import profile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    errors = [
        {key: value for key, value in error.items() if key != "input"}
        for error in exc.errors()
    ]
    return JSONResponse(status_code=422, content=jsonable_encoder({"detail": errors}))


app.include_router(food.router)
app.include_router(log.router)
app.include_router(summary.router)
app.include_router(profile.router)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
