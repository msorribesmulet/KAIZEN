from datetime import date
from sqlmodel import SQLModel, Field


class LogCreate(SQLModel):
    food_id: int
    grams: float
    date: date = Field(default_factory=date.today)
