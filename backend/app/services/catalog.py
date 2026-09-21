from fastapi import HTTPException
from sqlmodel import Session

from app.models.food import Food
from app.models.user import User


def visible_food(
    food_id: int, user: User, session: Session, allow_deleted: bool = False
) -> Food:
    food = session.get(Food, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    if food.is_deleted and not allow_deleted:
        raise HTTPException(status_code=404, detail="Food not found")
    if food.user_id is not None and food.user_id != user.id:
        raise HTTPException(status_code=404, detail="Food not found")

    return food


def owned_food(food_id: int, user: User, session: Session) -> Food:
    food = session.get(Food, food_id)
    if not food or food.is_deleted or food.user_id != user.id:
        raise HTTPException(status_code=404, detail="Food not found")

    return food
