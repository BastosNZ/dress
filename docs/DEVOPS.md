# DevOps do D.R.E.S.S. — Fase 2 (IaC e Entrega Contínua)

Este documento mostra onde está cada entrega da A2 e como usar.

| Entrega pedida | Onde está |
|---|---|
| Dockerfile otimizado | `D.R.E.S.S-main/backend/Dockerfile` e `D.R.E.S.S-main/frontend/Dockerfile` |
| Orquestração local | `docker-compose.yml` (MySQL + API + interface) |
| Pipeline de CD | `.github/workflows/cd.yml` (GHCR + deploy em homologação e produção) |
| Gestão de segredos | GitHub Environments + Secrets, sem senha no código (ver [Segredos](#segredos)) |
| Versionamento e rollback | tags `vX.Y.Z`, `CHANGELOG.md`, `scripts/deploy.sh` e `.github/workflows/rollback.yml` |

---

## Pipeline

```mermaid
flowchart LR
    PR[Pull request] --> CI
    subgraph CI [CI - ci.yml]
        T1[Testes backend<br/>Jest + supertest]
        T2[Checagem frontend]
        T3[Lint e build<br/>das imagens]
        T1 --> T3
        T2 --> T3
    end
    CI -->|merge| MAIN[Push na main]
    MAIN --> CD1[CI de novo]
    CD1 --> PUB1[Publica no GHCR<br/>tag sha-abc1234]
    PUB1 --> HML[Deploy homologação<br/>+ smoke test]

    TAG[Tag vX.Y.Z] --> CD2[CI]
    CD2 --> PUB2[Publica no GHCR<br/>X.Y.Z, X.Y, latest]
    PUB2 --> PRD{Deploy produção<br/>+ smoke test}
    PRD -->|passou| REL[Release no GitHub]
    PRD -->|falhou| RB[Rollback automático<br/>para a versão anterior]
```

| Evento | O que acontece |
|---|---|
| Pull request para `main` | CI: testes do backend, checagem do frontend, hadolint e build das duas imagens |
| Push na `main` (merge) | CI → imagens `sha-<commit>` e `main` no GHCR → deploy automático em **homologação** |
| Tag `v1.2.3` | CI → imagens `1.2.3`, `1.2` e `latest` → deploy em **produção** → release no GitHub |
| Actions → Rollback → Run workflow | Coloca no ar uma versão que já existe no GHCR |

### Ambientes simulados

Homologação e produção são **simulados**: o job sobe a aplicação com o mesmo
`docker-compose.yml` dentro do runner do GitHub Actions, baixando as imagens que
acabaram de ser publicadas no GHCR, e roda o smoke test. Num servidor de verdade
seria o mesmo `scripts/deploy.sh` executado lá (por SSH, por exemplo).

O smoke test (`scripts/smoke-test.sh`) confere:

1. `GET /health` responde `status: ok` e a **versão certa** (a do deploy)
2. login do admin funciona
3. uma rota protegida (`GET /produtos`) funciona com o token
4. a interface Streamlit responde

---

## Rodar local com Docker

```bash
cp .env.example .env        # troque as senhas
docker compose up -d --build
```

- Interface: http://localhost:8501
- API: http://localhost:3000/health
- Login: o `ADMIN_USERNAME` / `ADMIN_PASSWORD` que você colocou no `.env`

Para parar: `docker compose down` (os dados ficam no volume `db_data`;
`docker compose down -v` apaga o banco também).

### O que tem de otimização nos Dockerfiles

- **Backend em duas etapas (multi-stage):** a imagem final não leva
  devDependencies (jest, nodemon) nem cache do npm.
- **Base pequena:** `node:20-alpine` e `python:3.12-slim`.
- **Cache de camadas:** os arquivos de dependência são copiados antes do
  código, então mudar o código não reinstala tudo.
- **`.dockerignore`:** não copia `node_modules`, testes nem `.env` para a imagem.
- **Usuário sem root** nos dois containers.
- **HEALTHCHECK** nos dois: o compose só sobe a interface depois que a API está
  saudável, e a API só depois que o MySQL está pronto.
- **Versão dentro da imagem:** o build recebe `APP_VERSION`, que aparece no `/health`.
- **Desligamento limpo:** a API trata o SIGTERM do `docker stop`.

---

## Segredos

Nenhuma senha fica no código. O que mudou para isso:

- antes o JWT tinha um segredo padrão (`segredo_dev`) no código e o admin era
  sempre `admin` / `123456`. Agora o servidor **não sobe** sem `JWT_SECRET`, e o
  primeiro admin vem de `ADMIN_PASSWORD`;
- o `docker-compose.yml` só tem referências (`${JWT_SECRET:?...}`). Se faltar
  algum segredo, o compose para com erro em vez de subir com senha vazia;
- o `.env` está no `.gitignore`; no repositório só existe o `.env.example`.

No pipeline os valores ficam nos **Environments** do GitHub
(Settings → Environments), um conjunto para cada ambiente:

| Secret | Para que serve |
|---|---|
| `DB_PASSWORD` | senha do usuário da aplicação no MySQL |
| `DB_ROOT_PASSWORD` | senha do root do MySQL |
| `JWT_SECRET` | assinatura dos tokens de login |
| `ADMIN_PASSWORD` | senha do primeiro administrador |

O login no GHCR usa o `GITHUB_TOKEN` que o próprio Actions cria; não tem senha
de registry guardada. O GitHub esconde (`***`) qualquer secret que aparecer no log.

Para criar pelo terminal (cada comando pede o valor):

```bash
gh secret set JWT_SECRET --env producao
gh secret set ADMIN_PASSWORD --env producao
# ... e o mesmo para homologacao
```

---

## Versionamento semântico

Seguimos `MAJOR.MINOR.PATCH`:

- **PATCH** (1.1.**1**): correção de bug, sem mudar a API
- **MINOR** (1.**2**.0): funcionalidade nova compatível
- **MAJOR** (**2**.0.0): mudança que quebra quem usa a API

Para lançar uma versão:

```bash
# 1. atualizar a versão e o CHANGELOG.md
cd D.R.E.S.S-main/backend && npm version 1.2.0 --no-git-tag-version && cd -
# 2. commit (via PR na main)
# 3. criar a tag a partir da main
git checkout main && git pull
git tag v1.2.0
git push origin v1.2.0
```

Cada versão gera estas imagens no GHCR:

```
ghcr.io/bastosnz/dress-backend:1.2.0     versão exata (usada no deploy e no rollback)
ghcr.io/bastosnz/dress-backend:1.2       última correção da 1.2
ghcr.io/bastosnz/dress-backend:latest    última versão estável
ghcr.io/bastosnz/dress-backend:sha-abc1234   cada commit da main
```

(e o mesmo para `dress-frontend`)

---

## Rollback

### Automático (no deploy de produção)

O `scripts/deploy.sh` sobe a versão nova e roda o smoke test. Se algo falhar
(container não fica saudável, versão errada, login quebrado), ele:

1. mostra os logs da API;
2. coloca no ar a **versão anterior** (a tag `vX.Y.Z` mais recente antes da atual);
3. confere a versão anterior com o smoke test;
4. termina com erro: o job fica vermelho e a release **não** é criada.

### Manual

**Actions → Rollback → Run workflow**, escolhendo o ambiente e a versão
(ex.: `1.1.0`). O workflow confere se a imagem existe no GHCR e faz o deploy dela.

Pelo terminal é o mesmo script com a versão antiga:

```bash
scripts/deploy.sh producao 1.1.0
```

### Simulação documentada

Roteiro usado para gerar a evidência:

1. **Versão boa no ar:** tag `v1.1.0` → pipeline verde → release `v1.1.0`.
2. **Versão com defeito:** numa branch, o `/health` foi alterado para sempre
   responder erro 500, e foi criada a tag `v1.1.1`.
3. **O pipeline detecta:** o container da 1.1.1 não fica saudável, o deploy
   falha e o script faz o rollback para a **1.1.0**, que passa no smoke test.
4. **Resultado:** job de produção vermelho com o log
   `ROLLBACK: voltando [producao] para a versão 1.1.0` e
   `Rollback concluído`; nenhuma release `v1.1.1` criada.

Para repetir na máquina, sem depender do GHCR (`BUILD_LOCAL=1` builda as imagens localmente):

```bash
set -a; source .env; set +a

# versão boa
BUILD_LOCAL=1 scripts/deploy.sh producao 1.1.0

# estraga o /health de propósito
sed -i "s/res.json({ status: 'ok'/res.status(500).json({ status: 'quebrado'/" D.R.E.S.S-main/backend/routes/healthRoutes.js
BUILD_LOCAL=1 scripts/deploy.sh producao 1.1.1     # falha e volta sozinho para a 1.1.0

# desfaz a alteração
git checkout D.R.E.S.S-main/backend/routes/healthRoutes.js
```

---

## Estratégia de branches

Trunk-based: a `main` é o tronco e está sempre pronta para deploy.

- trabalho em branches curtas (`feat/...`, `fix/...`, `docs/...`, `chore/...`)
  que voltam para a `main` por pull request;
- a `main` é protegida: só entra por PR, com o CI verde;
- commits no padrão Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `ci:`);
- versão publicada = tag `vX.Y.Z` na `main`.
