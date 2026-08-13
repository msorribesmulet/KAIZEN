from sqlmodel import SQLModel, Field
from app.models.profile import ActivityLevel, Goal, Sex


class ProfileCreate(SQLModel):
    weight: float = Field(gt=0)
    height: float = Field(gt=0)
    age: int = Field(gt=0)
    sex: Sex
    activity_lvl: ActivityLevel
    goal: Goal
    kg_per_week: float = Field(ge=0)
