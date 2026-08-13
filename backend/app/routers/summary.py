from datetime import date as date_type
from fastapi import APIRouter, Depends, HTTPException
from app.database import get_session
from app.models.log import Log
from app.models.food import Food
from app.models.profile import Profile
from app.schemas.summary import Macros, SummaryResponse
from app.services.operations import bmr, calculate_macros, target_calories, tdee
from sqlmodel import Session, select

router = APIRouter()


def _consumed_macros(session: Session, day: date_type) -> Macros:
    """Suma lo comido ese día cruzando cada registro con su alimento."""
    results = session.exec(
        select(Log, Food).join(Food, Log.food_id == Food.id).where(Log.date == day)
    ).all()

    calories, protein, carbs, fats = 0, 0, 0, 0
    for log, food in results:
        factor = log.grams / 100
        calories += food.cal_100g * factor
        protein += food.protein_100g * factor
        carbs += food.carbs_100g * factor
        fats += food.fat_100g * factor
    return Macros(calories=calories, protein=protein, carbs=carbs, fats=fats)


def _target_macros(profile: Profile) -> Macros:
    """Objetivo del día a partir del perfil: BMR -> TDEE -> calorías -> macros."""
    profile_bmr = bmr(profile.weight, profile.height, profile.age, profile.sex)
    profile_tdee = tdee(profile_bmr, profile.activity_lvl)
    calories = target_calories(profile_tdee, profile.goal, profile.kg_per_week)
    macros = calculate_macros(profile.weight, calories)

    # calculate_macros devuelve la grasa como "fat"; el schema la expone como "fats".
    return Macros(
        calories=calories,
        protein=macros["protein"],
        carbs=macros["carbs"],
        fats=macros["fat"],
    )


@router.get("/summary/{date}", response_model=SummaryResponse)
def get_summary(date: date_type, session: Session = Depends(get_session)):
    consumed = _consumed_macros(session, date)

    # El objetivo sale del perfil: sin perfil no hay nada con lo que comparar.
    profile = session.exec(select(Profile)).first()
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found: create a profile to get daily targets",
        )

    target = _target_macros(profile)

    remaining = Macros(
        calories=target.calories - consumed.calories,
        protein=target.protein - consumed.protein,
        carbs=target.carbs - consumed.carbs,
        fats=target.fats - consumed.fats,
    )

    return SummaryResponse(
        date=date,
        consumed=consumed,
        target=target,
        remaining=remaining,
    )
