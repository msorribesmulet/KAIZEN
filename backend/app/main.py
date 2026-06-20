from fastapi import FastAPI
from app.database import create_db_and_tables
from app.models.food import Food
from app.models.log import Log

app = FastAPI()


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
