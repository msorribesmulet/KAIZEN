from sqlmodel import SQLModel, Field
from app.models.profile import ActivityLevel, Goal, Sex


class ProfileCreate(SQLModel):
    weight_kg: float = Field(gt=0)
    height_cm: float = Field(gt=0)
    age: int = Field(gt=0)
    sex: Sex
    activity_level: ActivityLevel
    goal: Goal
    kg_per_week: float = Field(ge=0)
