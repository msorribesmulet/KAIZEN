from datetime import date as date_type
from sqlmodel import SQLModel, Field
from app.models.food import Food


class LogCreate(SQLModel):
    food_id: int
    grams: float = Field(gt=0)
    date: date_type = Field(default_factory=date_type.today)


class LogRead(SQLModel):
    id: int
    food_id: int
    grams: float
    date: date_type
    food: Food | None
