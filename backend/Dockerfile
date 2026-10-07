# syntax=docker/dockerfile:1
FROM python:3.12-slim as base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3-dev libpq-dev \
    && rm -rf /var/lib/apt/lists/*

FROM base as builder
COPY backend/requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

FROM base as development
COPY --from=builder /app/wheels /wheels
COPY backend/requirements.txt .
RUN pip install --no-cache /wheels/*
COPY backend/ /app/
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

FROM base as production
RUN addgroup --system appuser && adduser --system --group appuser
COPY --from=builder /app/wheels /wheels
COPY backend/requirements.txt .
RUN pip install --no-cache /wheels/*
COPY backend/ /app/
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
