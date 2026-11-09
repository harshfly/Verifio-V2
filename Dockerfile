FROM python:3.11-slim

WORKDIR /app

# Install dependencies first for layer caching
COPY backend/requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY backend/ .

# Pre-download NLTK tokenizer resources
RUN python -c "import nltk; nltk.download('punkt_tab')"

EXPOSE 8000

# Start FastAPI uvicorn server binding to Render's dynamic $PORT
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
