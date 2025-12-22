FROM python:3.11-slim

WORKDIR /app

<<<<<<< HEAD
# Only basic tools needed now
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

=======
>>>>>>> a54844c0c0806b07b4cbe8bff03ed360a7462364
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
<<<<<<< HEAD
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
=======

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
>>>>>>> a54844c0c0806b07b4cbe8bff03ed360a7462364
