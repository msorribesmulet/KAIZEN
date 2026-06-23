from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.food import Food
from app.schemas.food import FoodCreate

router = APIRouter()


@router.post("/foods")
def create_food(food: FoodCreate, session: Session = Depends(get_session)):
    new_food = Food(
        name=food.name,
        cal_100g=food.cal_100g,
        protein_100g=food.protein_100g,
        carbs_100g=food.carbs_100g,
        fat_100g=food.fat_100g,
    )
    session.add(new_food)
    session.commit()
    session.refresh(new_food)
    return new_food


@router.get("/foods")
def get_foods(session: Session = Depends(get_session)):
    foods = session.exec(select(Food)).all()
    return foods


@router.delete("/foods/{food_id}")
def delete_food(food_id: int, session: Session = Depends(get_session)):
    food = session.get(Food, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    session.delete(food)
    session.commit()
    return {"ok": True}


@router.put("/foods/{food_id}")
def update_food(
    food_id: int, food: FoodCreate, session: Session = Depends(get_session)
):
    db_food = session.get(Food, food_id)
    if not db_food:
        raise HTTPException(status_code=404, detail="Food not found")
    db_food.name = food.name
    db_food.cal_100g = food.cal_100g
    db_food.protein_100g = food.protein_100g
    db_food.carbs_100g = food.carbs_100g
    db_food.fat_100g = food.fat_100g
    session.add(db_food)
    session.commit()
    session.refresh(db_food)
    return db_food
