from typing import Annotated

from pydantic import Field, StringConstraints
from sqlmodel import SQLModel

FoodName = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)
]
Per100g = Annotated[float, Field(ge=0, allow_inf_nan=False)]


class FoodCreate(SQLModel):
    name: FoodName
    cal_100g: Per100g
    protein_100g: Per100g
    carbs_100g: Per100g
    fat_100g: Per100g
