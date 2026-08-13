from datetime import date
from sqlmodel import SQLModel


class Macros(SQLModel):
    calories: float
    protein: float
    carbs: float
    fats: float


class SummaryResponse(SQLModel):
    date: date
    consumed: Macros
    target: Macros
    remaining: Macros
