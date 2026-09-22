import os
from datetime import date

import pytest

from app.models.log import Log

SQLITE_ONLY = pytest.mark.skipif(
    bool(os.getenv("TEST_DATABASE_URL")),
    reason="PostgreSQL comprueba las claves foraneas: el huerfano no se puede crear",
)


def create_food(client, food_payload) -> int:
    response = client.post("/foods", json=food_payload)
    assert response.status_code == 200
    return response.json()["id"]


class TestFoods:
    def test_create_and_list(self, client, food_payload):
        create_food(client, food_payload)
        foods = client.get("/foods").json()

        assert len(foods) == 1
        assert foods[0]["name"] == "Pechuga de pollo"

    def test_list_is_empty_by_default(self, client):
        assert client.get("/foods").json() == []

    def test_update(self, client, food_payload):
        food_id = create_food(client, food_payload)
        response = client.put(
            f"/foods/{food_id}", json={**food_payload, "cal_100g": 170}
        )

        assert response.status_code == 200
        assert response.json()["cal_100g"] == 170

    def test_delete(self, client, food_payload):
        food_id = create_food(client, food_payload)

        assert client.delete(f"/foods/{food_id}").status_code == 200
        assert client.get("/foods").json() == []

    def test_update_missing_food_is_404(self, client, food_payload):
        assert client.put("/foods/999", json=food_payload).status_code == 404

    def test_delete_missing_food_is_404(self, client):
        assert client.delete("/foods/999").status_code == 404

    def test_delete_twice_is_404(self, client, food_payload):
        food_id = create_food(client, food_payload)

        assert client.delete(f"/foods/{food_id}").status_code == 200
        assert client.delete(f"/foods/{food_id}").status_code == 404

    def test_update_a_deleted_food_is_404(self, client, food_payload):
        food_id = create_food(client, food_payload)
        client.delete(f"/foods/{food_id}")

        assert client.put(f"/foods/{food_id}", json=food_payload).status_code == 404

    @pytest.mark.parametrize(
        "field", ["cal_100g", "protein_100g", "carbs_100g", "fat_100g"]
    )
    def test_rejects_negative_values(self, client, food_payload, field):
        response = client.post("/foods", json={**food_payload, field: -1})

        assert response.status_code == 422

    def test_rejects_a_name_that_is_too_long(self, client, food_payload):
        response = client.post("/foods", json={**food_payload, "name": "a" * 121})

        assert response.status_code == 422

    def test_rejects_an_empty_name(self, client, food_payload):
        response = client.post("/foods", json={**food_payload, "name": ""})

        assert response.status_code == 422

    def test_rejects_a_blank_name(self, client, food_payload):
        response = client.post("/foods", json={**food_payload, "name": "   "})

        assert response.status_code == 422

    def test_trims_the_name(self, client, food_payload):
        create_food(client, {**food_payload, "name": "  Arroz  "})

        assert client.get("/foods").json()[0]["name"] == "Arroz"

    def test_rejects_infinity_without_poisoning_the_catalog(self, client):
        response = client.post(
            "/foods",
            content=(
                b'{"name":"X","cal_100g":Infinity,"protein_100g":1,'
                b'"carbs_100g":1,"fat_100g":1}'
            ),
            headers={"content-type": "application/json"},
        )

        assert response.status_code == 422
        assert client.get("/foods").json() == []

    def test_validation_errors_keep_the_detail_shape(self, client, food_payload):
        response = client.post("/foods", json={**food_payload, "cal_100g": -1})

        assert response.status_code == 422
        assert "msg" in response.json()["detail"][0]


class TestLogs:
    def test_create_and_list(self, client, food_payload):
        food_id = create_food(client, food_payload)
        response = client.post(
            "/logs", json={"food_id": food_id, "grams": 200, "date": "2026-08-10"}
        )

        assert response.status_code == 200
        assert len(client.get("/logs").json()) == 1

    def test_filter_by_date(self, client, food_payload):
        food_id = create_food(client, food_payload)
        for day in ("2026-08-10", "2026-08-11"):
            client.post("/logs", json={"food_id": food_id, "grams": 100, "date": day})

        logs = client.get("/logs", params={"date": "2026-08-10"}).json()

        assert len(logs) == 1
        assert logs[0]["date"] == "2026-08-10"

    def test_filter_by_day_without_logs_returns_empty_list(self, client):
        response = client.get("/logs", params={"date": "2026-01-01"})

        assert response.status_code == 200
        assert response.json() == []

    def test_rejects_invalid_date(self, client):
        assert client.get("/logs", params={"date": "not-a-date"}).status_code == 422

    def test_rejects_zero_grams(self, client, food_payload):
        food_id = create_food(client, food_payload)
        response = client.post(
            "/logs", json={"food_id": food_id, "grams": 0, "date": "2026-08-10"}
        )

        assert response.status_code == 422

    def test_each_log_arrives_with_its_food(self, client, food_payload):
        food_id = create_food(client, food_payload)
        client.post(
            "/logs", json={"food_id": food_id, "grams": 100, "date": "2026-08-10"}
        )

        log = client.get("/logs").json()[0]

        assert log["food"]["name"] == "Pechuga de pollo"
        assert log["food"]["cal_100g"] == 165

    def test_a_deleted_food_still_arrives_with_its_log(self, client, food_payload):
        food_id = create_food(client, food_payload)
        client.post(
            "/logs", json={"food_id": food_id, "grams": 100, "date": "2026-08-10"}
        )
        client.delete(f"/foods/{food_id}")

        log = client.get("/logs").json()[0]

        assert log["food"]["name"] == "Pechuga de pollo"
        assert log["food"]["is_deleted"] is True

    @SQLITE_ONLY
    def test_an_orphan_log_arrives_with_food_null(self, client, session, user_id):
        session.add(
            Log(user_id=user_id, food_id=999, grams=100, date=date(2026, 8, 10))
        )
        session.commit()

        assert client.get("/logs").json()[0]["food"] is None

    def test_rejects_a_food_id_that_does_not_exist(self, client):
        response = client.post(
            "/logs", json={"food_id": 999, "grams": 100, "date": "2026-08-10"}
        )

        assert response.status_code == 404

    def test_rejects_a_deleted_food(self, client, food_payload):
        food_id = create_food(client, food_payload)
        client.delete(f"/foods/{food_id}")

        response = client.post(
            "/logs", json={"food_id": food_id, "grams": 100, "date": "2026-08-10"}
        )

        assert response.status_code == 404

    def test_update_changes_the_grams(self, client, food_payload):
        food_id = create_food(client, food_payload)
        log_id = client.post(
            "/logs", json={"food_id": food_id, "grams": 100, "date": "2026-08-10"}
        ).json()["id"]

        response = client.put(
            f"/logs/{log_id}",
            json={"food_id": food_id, "grams": 150, "date": "2026-08-10"},
        )

        assert response.status_code == 200
        assert client.get("/logs").json()[0]["grams"] == 150

    def test_update_still_works_when_its_food_was_deleted(self, client, food_payload):
        food_id = create_food(client, food_payload)
        log_id = client.post(
            "/logs", json={"food_id": food_id, "grams": 100, "date": "2026-08-10"}
        ).json()["id"]
        client.delete(f"/foods/{food_id}")

        response = client.put(
            f"/logs/{log_id}",
            json={"food_id": food_id, "grams": 150, "date": "2026-08-10"},
        )

        assert response.status_code == 200
        assert client.get("/logs").json()[0]["grams"] == 150

    def test_rejects_absurd_grams(self, client, food_payload):
        food_id = create_food(client, food_payload)
        response = client.post(
            "/logs", json={"food_id": food_id, "grams": 1e12, "date": "2026-08-10"}
        )

        assert response.status_code == 422

    def test_update_rejects_a_food_id_that_does_not_exist(self, client, food_payload):
        food_id = create_food(client, food_payload)
        log_id = client.post(
            "/logs", json={"food_id": food_id, "grams": 100, "date": "2026-08-10"}
        ).json()["id"]

        response = client.put(
            f"/logs/{log_id}",
            json={"food_id": 999, "grams": 150, "date": "2026-08-10"},
        )

        assert response.status_code == 404


class TestProfile:
    def test_get_without_profile_is_404(self, client):
        assert client.get("/profile").status_code == 404

    def test_put_creates_when_missing(self, client, profile_payload):
        response = client.put("/profile", json=profile_payload)

        assert response.status_code == 200
        assert response.json()["weight_kg"] == 78

    def test_put_updates_without_creating_a_second_row(self, client, profile_payload):
        created = client.put("/profile", json=profile_payload).json()
        updated = client.put(
            "/profile", json={**profile_payload, "weight_kg": 80}
        ).json()

        assert updated["id"] == created["id"]
        assert updated["weight_kg"] == 80

    def test_enums_are_returned_in_lowercase(self, client, profile_payload):
        profile = client.put("/profile", json=profile_payload).json()

        assert profile["sex"] == "male"
        assert profile["activity_level"] == "moderate"
        assert profile["goal"] == "lose"

    def test_post_twice_is_409(self, client, profile_payload):
        client.post("/profile", json=profile_payload)

        assert client.post("/profile", json=profile_payload).status_code == 409

    @pytest.mark.parametrize(
        ("field", "value"),
        [
            ("weight_kg", -5),
            ("height_cm", 0),
            ("age", 0),
            ("sex", "unknown"),
            ("activity_level", "very_fit"),
            ("goal", "bulk"),
            ("kg_per_week", -1),
        ],
    )
    def test_rejects_invalid_values(self, client, profile_payload, field, value):
        response = client.put("/profile", json={**profile_payload, field: value})

        assert response.status_code == 422


class TestSummary:
    def test_without_profile_is_404(self, client):
        assert client.get("/summary/2026-08-10").status_code == 404

    def test_targets_come_from_the_profile(self, client, profile_payload):
        client.put("/profile", json=profile_payload)
        target = client.get("/summary/2026-08-10").json()["target"]

        assert target["calories"] == pytest.approx(2185.75)
        assert target["protein"] == pytest.approx(156)
        assert target["fat"] == pytest.approx(62.4)

    def test_consumed_is_zero_without_logs(self, client, profile_payload):
        client.put("/profile", json=profile_payload)
        consumed = client.get("/summary/2026-08-10").json()["consumed"]

        assert consumed == {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}

    def test_consumed_scales_with_grams(self, client, profile_payload, food_payload):
        client.put("/profile", json=profile_payload)
        food_id = create_food(client, food_payload)
        client.post(
            "/logs", json={"food_id": food_id, "grams": 200, "date": "2026-08-10"}
        )

        consumed = client.get("/summary/2026-08-10").json()["consumed"]

        assert consumed["calories"] == pytest.approx(330)
        assert consumed["protein"] == pytest.approx(62)

    def test_remaining_is_target_minus_consumed(
        self, client, profile_payload, food_payload
    ):
        client.put("/profile", json=profile_payload)
        food_id = create_food(client, food_payload)
        client.post(
            "/logs", json={"food_id": food_id, "grams": 200, "date": "2026-08-10"}
        )

        summary = client.get("/summary/2026-08-10").json()

        for macro in ("calories", "protein", "carbs", "fat"):
            expected = summary["target"][macro] - summary["consumed"][macro]
            assert summary["remaining"][macro] == pytest.approx(expected)

    def test_borrar_un_alimento_no_altera_los_dias_pasados(
        self, client, profile_payload, food_payload
    ):
        client.put("/profile", json=profile_payload)
        food_id = create_food(client, food_payload)
        client.post(
            "/logs", json={"food_id": food_id, "grams": 200, "date": "2026-08-10"}
        )

        antes = client.get("/summary/2026-08-10").json()["consumed"]
        client.delete(f"/foods/{food_id}")
        despues = client.get("/summary/2026-08-10").json()["consumed"]

        assert antes["calories"] == pytest.approx(330)
        assert despues == antes

    def test_only_counts_logs_from_that_day(
        self, client, profile_payload, food_payload
    ):
        client.put("/profile", json=profile_payload)
        food_id = create_food(client, food_payload)
        client.post(
            "/logs", json={"food_id": food_id, "grams": 200, "date": "2026-08-11"}
        )

        consumed = client.get("/summary/2026-08-10").json()["consumed"]

        assert consumed["calories"] == 0
