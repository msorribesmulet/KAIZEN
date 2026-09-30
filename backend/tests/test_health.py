import pytest

from app.config import normalize_database_url, positive_int


class TestHealth:
    def test_answers_without_session(self, anon_client):
        response = anon_client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestDatabaseUrl:
    def test_leaves_a_normal_url_alone(self):
        assert normalize_database_url("postgresql://u@h/db") == "postgresql://u@h/db"

    def test_leaves_sqlite_alone(self):
        assert normalize_database_url("sqlite:///kaizen.db") == "sqlite:///kaizen.db"

    def test_fixes_the_scheme_that_render_hands_out(self):
        fixed = normalize_database_url("postgres://u:p@h:5432/db")

        assert fixed == "postgresql://u:p@h:5432/db"


class TestPositiveSetting:
    def test_uses_the_default_when_unset(self, monkeypatch):
        monkeypatch.delenv("KAIZEN_TEST_SETTING", raising=False)

        assert positive_int("KAIZEN_TEST_SETTING", 5) == 5

    def test_reads_the_environment(self, monkeypatch):
        monkeypatch.setenv("KAIZEN_TEST_SETTING", "3")

        assert positive_int("KAIZEN_TEST_SETTING", 5) == 3

    @pytest.mark.parametrize("value", ["0", "-1"])
    def test_refuses_to_start_below_one(self, monkeypatch, value):
        monkeypatch.setenv("KAIZEN_TEST_SETTING", value)

        with pytest.raises(RuntimeError, match="KAIZEN_TEST_SETTING"):
            positive_int("KAIZEN_TEST_SETTING", 5)
