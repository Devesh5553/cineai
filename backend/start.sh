#!/bin/sh
echo "Seeding database..."
python -m data.seed
echo "Starting server..."
python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
