# Imagem da API do D.R.E.S.S. (Node + Express)
#
# Build em duas etapas: a primeira instala as dependências e a segunda copia
# só o necessário. Assim a imagem final não leva cache do npm nem devDependencies
# (jest, nodemon, supertest).

# ---------- Etapa 1: dependências ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Copia só os arquivos de dependência primeiro: enquanto eles não mudarem,
# o Docker reaproveita essa camada e não roda o npm ci de novo
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- Etapa 2: imagem final ----------
FROM node:20-alpine

# Versão da imagem (o pipeline passa a tag, ex.: 1.1.0). Aparece no /health.
ARG APP_VERSION=local
ENV NODE_ENV=production \
    APP_VERSION=${APP_VERSION} \
    PORT=3000

LABEL org.opencontainers.image.title="dress-backend" \
      org.opencontainers.image.description="API REST do D.R.E.S.S." \
      org.opencontainers.image.version="${APP_VERSION}"

WORKDIR /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

# Não roda como root dentro do container (1000 é o usuário "node" da imagem oficial)
USER 1000

EXPOSE 3000

# O Node 20 já tem fetch, então não precisa instalar curl na imagem
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["node", "server.js"]
