# Imagem da interface do D.R.E.S.S. (Python + Streamlit)
FROM python:3.12-slim

# Sem .pyc, log sem buffer (aparece na hora no docker logs) e pip sem cache
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

ARG APP_VERSION=local
LABEL org.opencontainers.image.title="dress-frontend" \
      org.opencontainers.image.description="Painel Streamlit do D.R.E.S.S." \
      org.opencontainers.image.version="${APP_VERSION}"

WORKDIR /app

# Dependências antes do código, pra aproveitar o cache das camadas
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app.py .

# Usuário sem privilégio de root
RUN useradd --create-home --uid 1001 app
USER 1001

# Endereço da API. No docker-compose vira http://backend:3000
ENV API_URL=http://localhost:3000

EXPOSE 8501

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8501/_stcore/health', timeout=3)"]

CMD ["streamlit", "run", "app.py", \
     "--server.address=0.0.0.0", \
     "--server.port=8501", \
     "--server.headless=true", \
     "--browser.gatherUsageStats=false"]
