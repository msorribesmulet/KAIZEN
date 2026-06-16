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


def calculate_macros(weight, target_calories):
    protein = weight * 2
    fat = weight * 0.8
    carbs = (target_calories - (protein * 4) - (fat * 9)) / 4
    macros = {"protein": protein, "fat": fat, "carbs": carbs}
    return macros


if __name__ == "__main__":
    mi_bmr = bmr(91.5, 187, 23, "man")
    print(f"BMR: {mi_bmr}")

    mi_tdee = tdee(mi_bmr, "moderate")
    print(f"TDEE: {mi_tdee}")

    mi_calories = target_calories(mi_tdee, "lose", 1)
    print(f"Target Calories: {mi_calories}")

    mi_macros = calculate_macros(91.5, mi_calories)
    print(f"Macros: {mi_macros}")
