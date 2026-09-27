FROM python:3.11-slim

WORKDIR /app

# Copiar requerimientos e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY . .

EXPOSE 8000

CMD ["uvicorn", "principal:aplicacion", "--host", "0.0.0.0", "--port", "8000"]
