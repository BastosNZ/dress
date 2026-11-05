#!/usr/bin/env bash
# Deploy de uma versão do D.R.E.S.S. com docker compose + smoke test.
# Se a versão nova não passar no smoke test, volta sozinho pra anterior (rollback).
#
# Uso:
#   scripts/deploy.sh <ambiente> <versao>
#
# Exemplos:
#   scripts/deploy.sh homologacao sha-1a2b3c4
#   scripts/deploy.sh producao 1.1.0
#
# Rollback manual = deploy da versão antiga:
#   scripts/deploy.sh producao 1.0.0
#
# Variáveis:
#   DB_PASSWORD, DB_ROOT_PASSWORD, JWT_SECRET, ADMIN_PASSWORD  obrigatórias
#                                     (no GitHub Actions vêm dos Secrets)
#   VERSAO_ANTERIOR  versão pra voltar se der errado. Se não vier, usa a
#                    última que este script colocou no ar (.versao-<ambiente>)
#   BUILD_LOCAL=1    builda as imagens na máquina em vez de baixar do GHCR
#                    (útil pra simular o rollback sem depender do registry)
set -euo pipefail

AMBIENTE="${1:?Informe o ambiente: homologacao ou producao}"
VERSAO="${2:?Informe a versão, ex.: 1.1.0}"

case "$AMBIENTE" in
  homologacao | producao) ;;
  *)
    echo "Ambiente inválido: $AMBIENTE (use homologacao ou producao)"
    exit 1
    ;;
esac

# roda a partir da raiz do repositório, onde está o docker-compose.yml
PASTA_SCRIPTS="$(cd "$(dirname "$0")" && pwd)"
cd "$PASTA_SCRIPTS/.."

ARQUIVO_VERSAO=".versao-$AMBIENTE"
VERSAO_ANTERIOR="${VERSAO_ANTERIOR:-$(cat "$ARQUIVO_VERSAO" 2>/dev/null || true)}"

# cada ambiente é um projeto separado do compose (containers e volume próprios)
export COMPOSE_PROJECT_NAME="dress-$AMBIENTE"

subir() {
  local versao="$1"
  export APP_VERSION="$versao"

  echo "==> [$AMBIENTE] subindo a versão $versao"
  # dentro de "if subir" o set -e não vale, então cada passo retorna na mão
  if [ "${BUILD_LOCAL:-0}" = "1" ]; then
    docker compose build backend frontend || return 1
  else
    docker compose pull backend frontend || return 1
  fi

  # --wait espera os healthchecks ficarem verdes (ou falha)
  docker compose up -d --no-build --wait --wait-timeout 180 || return 1
  "$PASTA_SCRIPTS/smoke-test.sh" "$versao"
}

if subir "$VERSAO"; then
  echo "$VERSAO" >"$ARQUIVO_VERSAO"
  echo "==> [$AMBIENTE] versão $VERSAO no ar"
  exit 0
fi

echo "==> [$AMBIENTE] a versão $VERSAO falhou"
docker compose logs --tail 50 backend || true

if [ -z "$VERSAO_ANTERIOR" ] || [ "$VERSAO_ANTERIOR" = "$VERSAO" ]; then
  echo "==> Sem versão anterior pra voltar. Rollback não foi possível."
  exit 1
fi

echo "==> ROLLBACK: voltando [$AMBIENTE] para a versão $VERSAO_ANTERIOR"
if subir "$VERSAO_ANTERIOR"; then
  echo "$VERSAO_ANTERIOR" >"$ARQUIVO_VERSAO"
  echo "==> Rollback concluído: [$AMBIENTE] voltou para $VERSAO_ANTERIOR"
else
  echo "==> O rollback também falhou. Precisa de intervenção manual."
fi

# sai com erro de qualquer jeito: o deploy da versão nova falhou
exit 1
