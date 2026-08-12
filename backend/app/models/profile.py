from enum import Enum
from sqlmodel import SQLModel, Field

class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"
    LIGHT = "light"
    MODERATE = "moderate"
    ACTIVE = "active"
    VERY_ACTIVE = "very_active"

class Goal(str, Enum):
    GAIN = "gain"
    LOSE = "lose"
    MAINTAIN = "maintain"


class Profile(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    weight: float
    height: float
    age:  int
    sex:  str
    activity_lvl: ActivityLevel
    goal: Goal
    kg_per_week: float

