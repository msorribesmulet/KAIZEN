import pytest
from sqlmodel import Session

from app.models.food import Food

LOG_DAY = "2026-08-10"


def add_global_food(session: Session) -> int:
    food = Food(
        user_id=None,
        name="Arroz blanco",
        cal_100g=130,
        protein_100g=2.7,
        carbs_100g=28,
        fat_100g=0.3,
    )
    session.add(food)
    session.commit()
    session.refresh(food)

    return food.id


def log_of(food_id: int) -> dict:
    return {"food_id": food_id, "grams": 100, "date": LOG_DAY}


class TestWithoutSession:
    @pytest.mark.parametrize(
        "path", ["/foods", "/logs", "/profile", f"/summary/{LOG_DAY}"]
    )
    def test_reading_is_401(self, anon_client, path):
        assert anon_client.get(path).status_code == 401

    def test_writing_is_401(self, anon_client, food_payload):
        assert anon_client.post("/foods", json=food_payload).status_code == 401


class TestFoodsBetweenUsers:
    def test_a_user_does_not_see_the_foods_of_another(
        self, client, other_client, food_payload
    ):
        client.post("/foods", json=food_payload)

        assert other_client.get("/foods").json() == []

    def test_a_user_cannot_edit_the_food_of_another(
        self, client, other_client, food_payload
    ):
        food_id = client.post("/foods", json=food_payload).json()["id"]

        assert (
            other_client.put(f"/foods/{food_id}", json=food_payload).status_code == 404
        )
        assert other_client.delete(f"/foods/{food_id}").status_code == 404

    def test_a_user_cannot_log_the_food_of_another(
        self, client, other_client, food_payload
    ):
        food_id = client.post("/foods", json=food_payload).json()["id"]

        assert other_client.post("/logs", json=log_of(food_id)).status_code == 404


class TestGlobalFoods:
    def test_everyone_sees_them(self, client, other_client, session):
        add_global_food(session)

        assert len(client.get("/foods").json()) == 1
        assert len(other_client.get("/foods").json()) == 1

    def test_anyone_can_log_them(self, client, other_client, session):
        food_id = add_global_food(session)

        assert client.post("/logs", json=log_of(food_id)).status_code == 200
        assert other_client.post("/logs", json=log_of(food_id)).status_code == 200

    def test_nobody_can_edit_or_delete_them(self, client, session, food_payload):
        food_id = add_global_food(session)

        assert client.put(f"/foods/{food_id}", json=food_payload).status_code == 404
        assert client.delete(f"/foods/{food_id}").status_code == 404


class TestLogsBetweenUsers:
    def test_a_user_does_not_see_the_logs_of_another(
        self, client, other_client, food_payload
    ):
        food_id = client.post("/foods", json=food_payload).json()["id"]
        client.post("/logs", json=log_of(food_id))

        assert other_client.get("/logs").json() == []

    def test_a_user_cannot_delete_the_log_of_another(
        self, client, other_client, food_payload
    ):
        food_id = client.post("/foods", json=food_payload).json()["id"]
        log_id = client.post("/logs", json=log_of(food_id)).json()["id"]

        assert other_client.delete(f"/logs/{log_id}").status_code == 404
        assert len(client.get("/logs").json()) == 1


class TestProfileBetweenUsers:
    def test_the_profile_of_one_is_not_the_profile_of_the_other(
        self, client, other_client, profile_payload
    ):
        client.put("/profile", json=profile_payload)

        assert other_client.get("/profile").status_code == 404

    def test_saving_one_profile_does_not_touch_the_other(
        self, client, other_client, profile_payload
    ):
        client.put("/profile", json=profile_payload)
        other_client.put("/profile", json={**profile_payload, "weight_kg": 90})

        assert client.get("/profile").json()["weight_kg"] == 78
        assert other_client.get("/profile").json()["weight_kg"] == 90

    def test_a_user_id_in_the_body_is_ignored(
        self, client, other_client, profile_payload
    ):
        stolen = other_client.get("/auth/me").json()["id"]
        client.put("/profile", json={**profile_payload, "user_id": stolen})

        assert other_client.get("/profile").status_code == 404


class TestSummaryBetweenUsers:
    def test_the_summary_only_counts_your_own_food(
        self, client, other_client, profile_payload, food_payload
    ):
        client.put("/profile", json=profile_payload)
        other_client.put("/profile", json=profile_payload)
        food_id = client.post("/foods", json=food_payload).json()["id"]
        client.post("/logs", json=log_of(food_id))

        mine = client.get(f"/summary/{LOG_DAY}").json()
        theirs = other_client.get(f"/summary/{LOG_DAY}").json()

        assert mine["consumed"]["calories"] == pytest.approx(165)
        assert theirs["consumed"]["calories"] == 0
