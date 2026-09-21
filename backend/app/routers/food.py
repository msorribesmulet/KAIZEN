from fastapi import APIRouter, Depends
from sqlmodel import Session, col, not_, or_, select

from app.database import get_session
from app.dependencies import get_current_user
from app.models.food import Food
from app.models.user import User
from app.schemas.food import FoodCreate
from app.services.catalog import owned_food

router = APIRouter()


@router.post("/foods", response_model=Food)
def create_food(
    food: FoodCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    new_food = Food(**food.model_dump(), user_id=user.id)
    session.add(new_food)
    session.commit()
    session.refresh(new_food)

    return new_food


@router.get("/foods", response_model=list[Food])
def get_foods(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    return session.exec(
        select(Food).where(
            not_(Food.is_deleted),
            or_(Food.user_id == user.id, col(Food.user_id).is_(None)),
        )
    ).all()


@router.delete("/foods/{food_id}")
def delete_food(
    food_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    food = owned_food(food_id, user, session)
    food.is_deleted = True
    session.add(food)
    session.commit()

    return {"ok": True}


@router.put("/foods/{food_id}", response_model=Food)
def update_food(
    food_id: int,
    food: FoodCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    db_food = owned_food(food_id, user, session)
    db_food.sqlmodel_update(food.model_dump())
    session.add(db_food)
    session.commit()
    session.refresh(db_food)

    return db_food
