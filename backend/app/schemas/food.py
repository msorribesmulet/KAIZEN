from sqlmodel import SQLModel


class FoodCreate(SQLModel):
    name: str
    cal_100g: float
    protein_100g: float
    carbs_100g: float
    fat_100g: float
