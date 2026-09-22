FROM node:22-alpine AS frontend

WORKDIR /build
RUN npm install --global pnpm@12.4.1

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend/ ./
ENV VITE_API_URL=""
RUN pnpm build


FROM python:3.13-slim

WORKDIR /srv

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY --from=frontend /build/dist ./static

ENV STATIC_DIR=/srv/static
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
