from datetime import date
from sqlmodel import SQLModel


class SummaryResponse(SQLModel):
    date: date
    calories: float
    protein: float
    carbs: float
    fats: float
