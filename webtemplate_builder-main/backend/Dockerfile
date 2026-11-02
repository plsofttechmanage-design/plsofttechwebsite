# ==============================================================================
# Website Template Marketplace & Builder - Backend Production Dockerfile
# ==============================================================================
FROM python:3.12-slim-bookworm AS base

# Prevent Python from writing .pyc files and force unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system dependencies including curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend codebase
COPY . /app/

# Create media, staticfiles, and logs directories with proper permissions
RUN mkdir -p /app/media /app/staticfiles /app/logs

# Collect static assets into staticfiles
RUN python manage.py collectstatic --noinput

# Expose internal Django port
EXPOSE 8000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/api/health/ || exit 1

# Launch script: run pending database migrations and start Gunicorn WSGI server
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --threads 2 --timeout 60 --access-logfile - --error-logfile -"]

