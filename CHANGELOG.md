# Changelog

As mudanças de cada versão do D.R.E.S.S. ficam aqui.
O projeto segue [versionamento semântico](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2026-11-05

### Adicionado
- Dockerfile do backend (multi-stage) e do frontend, com healthcheck e usuário sem root
- `docker-compose.yml` subindo MySQL, API e interface
- Pipeline de CI (testes, hadolint e build das imagens) e de CD (GHCR, deploy em
  homologação a cada merge e em produção a cada tag)
- Rollback automático no deploy e workflow de rollback manual
- Rota `GET /health` com status do banco e versão da aplicação
- Gestão de usuários: `GET/POST /usuarios`, `PATCH /usuarios/:id/ativo`,
  `PUT /auth/senha` e `GET /auth/me`
- `GET /relatorios/resumo` com total de vendas, faturamento e ticket médio
- Testes de integração da API com supertest

### Corrigido
- Qualquer pessoa conseguia criar usuário ADMIN sem login (`POST /auth/registrar`)
- Segredo padrão do JWT e senha fixa do admin no código
- Funcionário conseguia excluir cliente
- Relatório por período ignorava as vendas do último dia
- Venda com quantidade fracionada gravava total diferente dos itens
- Preço em texto, CPF com máscara e exclusão de produto vendido davam erro 500
- Estoque negativo e CPF inválido eram aceitos
- Erros vinham como página HTML ou com a mensagem crua do MySQL

### Alterado
- Cadastro de usuário saiu de `POST /auth/registrar` (público) para `POST /usuarios` (só ADMIN)
- `JWT_SECRET` e `ADMIN_PASSWORD` passaram a ser obrigatórios
- Frontend lê o endereço da API da variável `API_URL`

## [1.0.0]

- Versão entregue na A1: API REST com JWT, cadastro de clientes, produtos e
  vendas, relatórios e interface em Streamlit
