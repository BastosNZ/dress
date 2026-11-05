# D.R.E.S.S. - Digital Retail Enterprise Sales System

[![CD](https://github.com/BastosNZ/dress/actions/workflows/cd.yml/badge.svg)](https://github.com/BastosNZ/dress/actions/workflows/cd.yml)

Sistema web desenvolvido para gerenciamento de uma loja de roupas, permitindo o controle de clientes, produtos, estoque e vendas através de uma API REST integrada a uma interface gráfica.

Projeto desenvolvido para a disciplina de **Desenvolvimento Web**.

---

# Objetivo do Projeto

O D.R.E.S.S. tem como objetivo facilitar o gerenciamento de uma loja de roupas, oferecendo uma solução para administração de clientes, produtos, estoque e vendas, utilizando uma arquitetura composta por:

- API REST
- Interface Web
- Banco de Dados Relacional

---

# Funcionalidades

- Login de usuários
- Autenticação utilizando JWT
- Cadastro de clientes
- Edição de clientes
- Exclusão de clientes
- Cadastro de produtos
- Atualização de produtos
- Exclusão de produtos
- Controle de estoque
- Registro de vendas
- Atualização automática do estoque
- Relatórios de vendas
- Validação dos dados enviados para a API
- Rotas protegidas por autenticação

---

# Tecnologias Utilizadas

## Backend

- Node.js
- Express.js
- MySQL
- JWT (JSON Web Token)
- bcryptjs
- Dotenv

## Frontend

- Python
- Streamlit
- Requests
- Pandas

## DevOps

- Docker e Docker Compose
- GitHub Actions (CI/CD)
- GitHub Container Registry (GHCR)

## Banco de Dados

- MySQL

---

# Estrutura do Projeto

```
D.R.E.S.S-main
│
├── backend
│   ├── config
│   ├── middleware
│   ├── models
│   ├── repositories
│   ├── routes
│   ├── services
│   ├── tests
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend
│   ├── app.py
│   └── requirements.txt
│
├── database
│   ├── D.R.E.S.S.sql
│   └── seed.sql
│
└── README.md
```

---

# Rodando com Docker (jeito mais rápido)

Precisa só do Docker instalado.

```bash
git clone https://github.com/BastosNZ/dress.git
cd dress
cp .env.example .env      # preencha as senhas
docker compose up -d --build
```

- Interface: http://localhost:8501
- API: http://localhost:3000/health
- Login: `ADMIN_USERNAME` / `ADMIN_PASSWORD` do seu `.env`

O pipeline de CI/CD, os segredos, o versionamento e o rollback estão explicados
em [docs/DEVOPS.md](docs/DEVOPS.md). As mudanças de cada versão ficam no
[CHANGELOG.md](CHANGELOG.md).

---

# Rodando sem Docker

# Pré-requisitos

Antes de executar o projeto, instale:

- Node.js 18+
- Python 3.10+
- MySQL Server
- Git

---

# Clonando o Projeto

```bash
git clone https://github.com/BastosNZ/dress.git
```

Entre na pasta do projeto:

```bash
cd dress/D.R.E.S.S-main
```

---

# Configurando o Banco de Dados

Crie o banco vazio:

```sql
CREATE DATABASE dress;
```

As tabelas são criadas automaticamente na primeira execução do backend: o
`server.js` chama `initDatabase()`, que roda os `CREATE TABLE IF NOT EXISTS`,
insere os dados iniciais de clientes e produtos e cria o primeiro administrador
a partir do `.env` (veja abaixo).

Para criar o esquema manualmente, importe `database/D.R.E.S.S.sql` e,
opcionalmente, `database/seed.sql`.

---

# Configurando o Backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` baseado no `.env.example`.

Exemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=dress

JWT_SECRET=uma_frase_longa_e_aleatoria
JWT_EXPIRES_IN=1h

ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha_de_admin
```

`JWT_SECRET` é obrigatório: sem ele o servidor não sobe.

Na primeira execução, se o banco ainda não tiver nenhum administrador, o backend
cria um com `ADMIN_USERNAME` e `ADMIN_PASSWORD`. É com esse usuário que se faz o
primeiro login e se cadastram os outros usuários.

Execute o servidor:

```bash
npm start
```

ou

```bash
node server.js
```

A API estará disponível em:

```
http://localhost:3000
```

---

# Configurando o Frontend

Abra outro terminal.

Entre na pasta:

```bash
cd frontend
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Execute a aplicação:

```bash
streamlit run app.py
```

A interface será aberta automaticamente no navegador.

---

# Testes

O backend tem testes escritos com Jest. Os repositórios são mockados, então a
suíte roda sem banco de dados.

Na pasta `backend`:

```bash
npm test
```

Além dos testes de unidade dos serviços, há testes de integração com
`supertest` que sobem a API e testam as rotas (permissões, erros, validações),
também sem banco.

---

# Autenticação

O sistema utiliza autenticação baseada em **JWT (JSON Web Token)**.

Após realizar o login, a API retorna um token que deve ser enviado nas rotas protegidas através do cabeçalho:

```http
Authorization: Bearer SEU_TOKEN
```

---

# Principais Endpoints

Todas as rotas são montadas sobre `http://localhost:3000`.

As rotas marcadas com **token** exigem o cabeçalho
`Authorization: Bearer SEU_TOKEN`.

## Autenticação — `/auth`

| Método | Endpoint | Autenticação |
|---|---|---|
| POST | `/auth/login` | não |
| GET | `/auth/me` | token |
| PUT | `/auth/senha` | token |

## Usuários — `/usuarios`

| Método | Endpoint | Autenticação |
|---|---|---|
| GET | `/usuarios` | token + perfil `ADMIN` |
| POST | `/usuarios` | token + perfil `ADMIN` |
| PATCH | `/usuarios/:id/ativo` | token + perfil `ADMIN` |

## Clientes — `/clientes`

| Método | Endpoint | Autenticação |
|---|---|---|
| GET | `/clientes` | token |
| GET | `/clientes/:id` | token |
| POST | `/clientes` | token |
| PUT | `/clientes/:id` | token |
| DELETE | `/clientes/:id` | token + perfil `ADMIN` |

## Produtos — `/produtos`

| Método | Endpoint | Autenticação |
|---|---|---|
| GET | `/produtos` | token |
| GET | `/produtos/:id` | token |
| POST | `/produtos` | token |
| PUT | `/produtos/:id` | token |
| DELETE | `/produtos/:id` | token + perfil `ADMIN` |

## Vendas — `/vendas`

| Método | Endpoint | Autenticação |
|---|---|---|
| GET | `/vendas` | token |
| GET | `/vendas/:id` | token |
| POST | `/vendas` | token |

## Relatórios — `/relatorios`

| Método | Endpoint | Autenticação |
|---|---|---|
| GET | `/relatorios/periodo` | token |
| GET | `/relatorios/resumo` | token |
| GET | `/relatorios/cliente/:id` | token |

---

# Permissões

| Ação | ADMIN | FUNCIONARIO |
|---|---|---|
| Ver, cadastrar e editar clientes e produtos | sim | sim |
| Excluir clientes e produtos | sim | não |
| Registrar e consultar vendas | sim | sim |
| Ver relatórios | sim | sim |
| Cadastrar, listar e desativar usuários | sim | não |
| Trocar a própria senha | sim | sim |

Um usuário desativado perde o acesso na hora, mesmo que ainda tenha um token
válido. O sistema não deixa desativar o último administrador ativo.

---

# Regras de Negócio

- O usuário deve estar autenticado para acessar rotas protegidas.
- Não é permitido registrar vendas sem estoque disponível.
- O estoque é atualizado automaticamente após uma venda.
- A quantidade de cada item precisa ser um número inteiro maior que zero; o
  mesmo produto repetido na venda é somado numa linha só.
- O valor total da venda é a soma dos itens gravados.
- Produto que já foi vendido e cliente com vendas não podem ser excluídos.
- CPF é validado pelos dígitos verificadores e salvo só com os números (pode
  ser enviado com ou sem máscara).
- Preço não pode ser negativo; estoque e estoque mínimo são inteiros ≥ 0.
- Relatórios recebem datas no formato `AAAA-MM-DD` e incluem os dois dias do
  período (`inicio=2026-11-05&fim=2026-11-05` traz as vendas do dia todo).
- `GET /relatorios/resumo` devolve número de vendas, faturamento e ticket médio
  do período.
- Erros sempre voltam em JSON no formato `{ "erro": "mensagem" }`.

---

# Segurança

O projeto utiliza:

- JWT para autenticação.
- Bcrypt para criptografia de senhas.
- Variáveis de ambiente através do Dotenv.
- Middleware para proteção das rotas privadas.

---

# Organização do Projeto

O projeto segue uma arquitetura em camadas:

- Configuração
- Middleware
- Modelos
- Repositórios
- Serviços
- Rotas

Essa organização facilita a manutenção e escalabilidade da aplicação.

---

# Integrantes

- João Pedro Couto
- Thiago de Pádua 
- Enzo Bastos

---

# Status

Projeto desenvolvido como requisito da disciplina de **Desenvolvimento Web**, contemplando:

- API REST
- Autenticação JWT
- Banco de Dados MySQL
- Interface desenvolvida em Streamlit
- Integração entre Frontend e Backend

---

# Licença

Projeto desenvolvido exclusivamente para fins acadêmicos.
