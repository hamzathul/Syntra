# syntax=docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Install dependencies first (better layer caching). `--no-install-project`
# because the source isn't copied yet — without it `uv sync` fails: hatchling
# needs README.md + src/ai to build the project metadata.
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# Then copy the application source and install the project itself.
COPY src ./src
COPY README.md ./
RUN uv sync --frozen --no-dev

EXPOSE 3003

USER nobody

CMD [".venv/bin/uvicorn", "ai.main:app", "--host", "0.0.0.0", "--port", "3003"]
