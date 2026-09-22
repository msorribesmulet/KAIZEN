from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.spa import serve_spa

HTML = {"accept": "text/html,application/xhtml+xml"}
FETCH = {"accept": "*/*"}


def make_client(folder) -> TestClient:
    (folder / "index.html").write_text("<!doctype html>kaizen")
    (folder / "assets").mkdir()
    (folder / "assets" / "app.js").write_text("console.log(1)")

    app = FastAPI()

    @app.get("/foods")
    def foods():
        return ["de la api"]

    serve_spa(app, str(folder))

    return TestClient(app)


class TestSpa:
    def test_serves_a_real_file(self, tmp_path):
        response = make_client(tmp_path).get("/assets/app.js")

        assert response.status_code == 200
        assert "console.log" in response.text

    def test_a_frontend_route_gets_the_index(self, tmp_path):
        response = make_client(tmp_path).get("/dashboard", headers=HTML)

        assert response.status_code == 200
        assert "kaizen" in response.text

    def test_the_root_is_always_the_app(self, tmp_path):
        response = make_client(tmp_path).get("/", headers=FETCH)

        assert response.status_code == 200
        assert "kaizen" in response.text

    def test_the_api_still_wins(self, tmp_path):
        assert make_client(tmp_path).get("/foods").json() == ["de la api"]

    def test_an_unknown_fetch_gets_404_and_not_html(self, tmp_path):
        response = make_client(tmp_path).get("/food", headers=FETCH)

        assert response.status_code == 404

    def test_cannot_escape_the_static_folder(self, tmp_path):
        outside = tmp_path.parent / "secreto.txt"
        outside.write_text("no deberias ver esto")
        client = make_client(tmp_path)

        response = client.get("/..%2Fsecreto.txt", headers=FETCH)

        assert response.status_code == 404
        assert "no deberias" not in response.text
