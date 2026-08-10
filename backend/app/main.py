from fastapi import FastAPI
from app.database import create_db_and_tables
from app.models.food import Food
from app.routers import food
from app.models.log import Log
from app.routers import log
from app.routers import summary

app = FastAPI()

app.include_router(food.router)
app.include_router(log.router)
app.include_router(summary.router)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
