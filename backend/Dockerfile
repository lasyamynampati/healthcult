FROM python:3.12-slim

# Install netcat for database readiness check
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app

# Make startup script executable
RUN chmod +x /app/start.sh

EXPOSE 8000

CMD ["/app/start.sh"]
