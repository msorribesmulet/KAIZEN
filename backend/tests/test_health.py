from app.config import normalize_database_url


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
