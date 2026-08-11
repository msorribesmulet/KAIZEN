from datetime import date as date_type
from fastapi import APIRouter, Depends, HTTPException
from app.database import get_session
from app.models.log import Log
from app.models.food import Food
from app.schemas.summary import SummaryResponse
from sqlmodel import Session, select

router = APIRouter()


@router.get("/summary/{date}", response_model=SummaryResponse)
def get_summary(date: date_type, session: Session = Depends(get_session)):
    results = session.exec(
        select(Log, Food).join(Food, Log.food_id == Food.id).where(Log.date == date)
    ).all()

    calories, protein, carbs, fats = 0, 0, 0, 0
    for log, food in results:
        factor = log.grams / 100
        calories += food.cal_100g * factor
        protein += food.protein_100g * factor
        carbs += food.carbs_100g * factor
        fats += food.fat_100g * factor
    return {
        "date": date,
        "calories": calories,
        "protein": protein,
        "carbs": carbs,
        "fats": fats,
    }
