from datetime import date as date_type
from fastapi import APIRouter, Depends, HTTPException
from app.database import get_session
from app.dependencies import get_current_user
from app.models.log import Log
from app.models.food import Food
from app.models.profile import Profile
from app.models.user import User
from app.schemas.summary import Macros, SummaryResponse
from app.services.operations import bmr, calculate_macros, target_calories, tdee
from sqlmodel import Session, select

router = APIRouter()


def _consumed_macros(session: Session, day: date_type, user_id: int) -> Macros:
    """Suma lo comido ese día cruzando cada registro con su alimento."""
    results = session.exec(
        select(Log, Food)
        .join(Food, Log.food_id == Food.id)
        .where(Log.date == day, Log.user_id == user_id)
    ).all()

    calories, protein, carbs, fat = 0, 0, 0, 0
    for log, food in results:
        factor = log.grams / 100
        calories += food.cal_100g * factor
        protein += food.protein_100g * factor
        carbs += food.carbs_100g * factor
        fat += food.fat_100g * factor
    return Macros(calories=calories, protein=protein, carbs=carbs, fat=fat)


def _target_macros(profile: Profile) -> Macros:
    """Objetivo del día a partir del perfil: BMR -> TDEE -> calorías -> macros."""
    profile_bmr = bmr(profile.weight_kg, profile.height_cm, profile.age, profile.sex)
    profile_tdee = tdee(profile_bmr, profile.activity_level)
    calories = target_calories(profile_tdee, profile.goal, profile.kg_per_week)
    macros = calculate_macros(profile.weight_kg, calories)

    return Macros(
        calories=calories,
        protein=macros["protein"],
        carbs=macros["carbs"],
        fat=macros["fat"],
    )


@router.get("/summary/{date}", response_model=SummaryResponse)
def get_summary(
    date: date_type,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    consumed = _consumed_macros(session, date, user.id)

    # El objetivo sale del perfil: sin perfil no hay nada con lo que comparar.
    profile = session.exec(select(Profile).where(Profile.user_id == user.id)).first()
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
        fat=target.fat - consumed.fat,
    )

    return SummaryResponse(
        date=date,
        consumed=consumed,
        target=target,
        remaining=remaining,
    )
