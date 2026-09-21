from datetime import date as date_type
from typing import Annotated

from pydantic import Field
from sqlmodel import SQLModel

from app.models.food import Food


class LogCreate(SQLModel):
    food_id: Annotated[int, Field(gt=0)]
    grams: Annotated[float, Field(gt=0, le=10000, allow_inf_nan=False)]
    date: date_type = Field(default_factory=date_type.today)


class LogRead(SQLModel):
    id: int
    food_id: int
    grams: float
    date: date_type
    food: Food | None
