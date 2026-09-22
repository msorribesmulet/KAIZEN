from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse


def serve_spa(app: FastAPI, static_dir: str) -> None:
    root = Path(static_dir).resolve()
    index = root / "index.html"

    @app.get("/{full_path:path}")
    def spa(full_path: str, request: Request) -> FileResponse:
        if not full_path:
            return FileResponse(index)

        asked = (root / full_path).resolve()
        if asked.is_file() and root in asked.parents:
            return FileResponse(asked)

        if "text/html" in request.headers.get("accept", ""):
            return FileResponse(index)

        raise HTTPException(status_code=404, detail="Not found")
