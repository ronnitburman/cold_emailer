# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies (if any needed for sqlite or others)
# RUN apt-get update && apt-get install -y gcc

# Copy requirements
COPY api-core/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY api-core/src /app/src
COPY backend/openapi.yaml /app/openapi.yaml

# Set Python path
ENV PYTHONPATH=/app/src

# Create directory for uploads and database
RUN mkdir -p /app/uploads /app/data

# Exposure port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "openapi_server.main:app", "--host", "0.0.0.0", "--port", "8000"]
