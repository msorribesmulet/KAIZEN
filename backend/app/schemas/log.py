from datetime import date as date_type
from sqlmodel import SQLModel, Field


class LogCreate(SQLModel):
    food_id: int
    grams: float = Field(gt=0)
    date: date_type = Field(default_factory=date_type.today)
