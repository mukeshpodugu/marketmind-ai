FROM python:3.12-slim

WORKDIR /app

# Install system dependencies needed for compiling psycopg2 and C++ projects
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies (CPU versions of PyTorch are smaller; for standard docker, installing requirements is standard)
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "run.py"]
