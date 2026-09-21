from sqlmodel import SQLModel, Field


class Food(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id", index=True)
    name: str
    cal_100g: float
    protein_100g: float
    carbs_100g: float
    fat_100g: float
    is_deleted: bool = False
