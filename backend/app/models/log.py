from sqlmodel import SQLModel, Field
from datetime import date


class Log(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    date: date
    food_id: int = Field(foreign_key="food.id")
    grams: float
