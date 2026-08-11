from sqlmodel import SQLModel, Field


class FoodCreate(SQLModel):
    name: str
    cal_100g: float = Field(ge=0)
    protein_100g: float = Field(ge=0)
    carbs_100g: float = Field(ge=0)
    fat_100g: float = Field(ge=0)
