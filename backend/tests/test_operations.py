import pytest

from app.models.profile import ActivityLevel, Goal, Sex
from app.services.operations import bmr, calculate_macros, target_calories, tdee


def test_bmr_male():
    assert bmr(78, 180, 29, Sex.MALE) == 1765


def test_bmr_female():
    assert bmr(78, 180, 29, Sex.FEMALE) == 1599


def test_bmr_rejects_unknown_sex():
    with pytest.raises(ValueError):
        bmr(78, 180, 29, "other")


@pytest.mark.parametrize(
    ("activity_level", "expected"),
    [
        (ActivityLevel.SEDENTARY, 2118.0),
        (ActivityLevel.LIGHT, 2426.875),
        (ActivityLevel.MODERATE, 2735.75),
        (ActivityLevel.ACTIVE, 3044.625),
        (ActivityLevel.VERY_ACTIVE, 3353.5),
    ],
)
def test_tdee_applies_activity_factor(activity_level, expected):
    assert tdee(1765, activity_level) == pytest.approx(expected)


def test_target_calories_lose_subtracts_deficit():
    assert target_calories(2735.75, Goal.LOSE, 0.5) == pytest.approx(2185.75)


def test_target_calories_gain_adds_surplus():
    assert target_calories(2735.75, Goal.GAIN, 0.5) == pytest.approx(3285.75)


def test_target_calories_maintain_ignores_kg_per_week():
    assert target_calories(2735.75, Goal.MAINTAIN, 0.5) == 2735.75


def test_calculate_macros_distribution():
    macros = calculate_macros(78, 2185.75)

    assert macros["protein"] == pytest.approx(156)
    assert macros["fat"] == pytest.approx(62.4)
    assert macros["carbs"] == pytest.approx(250.0375)


def test_calculate_macros_covers_the_full_target():
    weight, target = 78, 2185.75
    macros = calculate_macros(weight, target)
    total = macros["protein"] * 4 + macros["fat"] * 9 + macros["carbs"] * 4

    assert total == pytest.approx(target)


def test_calculate_macros_returns_negative_carbs_when_target_is_too_low():
    assert calculate_macros(100, 500)["carbs"] < 0
