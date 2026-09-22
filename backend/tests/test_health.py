class TestHealth:
    def test_answers_without_session(self, anon_client):
        response = anon_client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    def test_does_not_need_the_database(self, anon_client, monkeypatch):
        monkeypatch.delattr("app.database.engine")

        assert anon_client.get("/health").status_code == 200
