def bmr(weight, height, age, sex):
    bmr_formula = (10 * weight) + (6.25 * height) - (5 * age)
    if sex == "man":
        return bmr_formula + 5
    elif sex == "woman":
        return bmr_formula - 161
    else:
        raise ValueError(f"Sexo no válido: {sex}")


def tdee(bmr, activity_lvl):
    factors = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9,
    }
    return factors[activity_lvl] * bmr


def target_calories(tdee, goal, kg_per_week):
    calorie_adjustment = (kg_per_week * 7700) / 7
    if goal == "gain":
        return tdee + calorie_adjustment
    elif goal == "lose":
        return tdee - calorie_adjustment
    elif goal == "maintain":
        return tdee
    else:
        raise ValueError(f"Goal no válido: {goal}")
