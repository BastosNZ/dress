#!/usr/bin/env bash
# Teste rápido depois do deploy: a aplicação subiu e funciona de verdade?
#
# Uso: scripts/smoke-test.sh [versao_esperada]
#
# Confere: /health da API (e a versão), login do admin, uma rota protegida
# e o healthcheck da interface. Precisa de curl e jq.
set -euo pipefail

API="${API_URL:-http://localhost:${BACKEND_PORT:-3000}}"
FRONT="${FRONTEND_URL:-http://localhost:${FRONTEND_PORT:-8501}}"
VERSAO_ESPERADA="${1:-}"
export ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
: "${ADMIN_PASSWORD:?Defina ADMIN_PASSWORD}"

falhar() {
  echo "SMOKE TEST FALHOU: $1"
  exit 1
}

echo "-> API: GET /health"
health=$(curl -fsS --retry 10 --retry-delay 3 --retry-all-errors "$API/health") ||
  falhar "a API não respondeu o /health"
echo "   $health"

[ "$(echo "$health" | jq -r .status)" = "ok" ] || falhar "status da API não é ok"

if [ -n "$VERSAO_ESPERADA" ]; then
  versao_no_ar=$(echo "$health" | jq -r .versao)
  [ "$versao_no_ar" = "$VERSAO_ESPERADA" ] ||
    falhar "a versão no ar é $versao_no_ar, mas o deploy era da $VERSAO_ESPERADA"
fi

echo "-> API: login do admin"
# a senha vai pelo env do jq, não aparece na linha de comando
corpo=$(jq -n '{username: env.ADMIN_USERNAME, senha: env.ADMIN_PASSWORD}')
token=$(curl -fsS -X POST "$API/auth/login" -H 'Content-Type: application/json' -d "$corpo" | jq -r .token) ||
  falhar "o login do admin falhou"
[ -n "$token" ] && [ "$token" != "null" ] || falhar "o login não devolveu token"

echo "-> API: GET /produtos com o token"
curl -fsS "$API/produtos" -H "Authorization: Bearer $token" | jq -e 'type == "array"' >/dev/null ||
  falhar "GET /produtos não funcionou"

echo "-> Interface: healthcheck do Streamlit"
curl -fsS --retry 10 --retry-delay 3 --retry-all-errors "$FRONT/_stcore/health" >/dev/null ||
  falhar "a interface não respondeu"

echo "Smoke test OK${VERSAO_ESPERADA:+ (versão $VERSAO_ESPERADA)}"
