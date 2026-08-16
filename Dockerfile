FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads instance 

EXPOSE 5000

ENV FLASK_ENV=production
ENV DATABASE_PATH=/app/instance/app.db
ENV UPLOAD_FOLDER=uploads

CMD ["python3", "backend/app.py"]
