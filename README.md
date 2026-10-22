# D.R.E.S.S. - Digital Retail Enterprise Sales System

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
insere os dados iniciais de clientes e produtos e cria o usuário administrador
padrão.

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
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=dress

JWT_SECRET=sua_chave_secreta
```

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

O backend tem testes de unidade dos serviços escritos com Jest. Os repositórios
são mockados, então a suíte roda sem banco de dados.

Na pasta `backend`:

```bash
npm test
```

São 3 suítes e 14 testes, cobrindo as regras de negócio de clientes, produtos e
vendas.

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
| POST | `/auth/registrar` | não |

## Clientes — `/clientes`

| Método | Endpoint | Autenticação |
|---|---|---|
| GET | `/clientes` | token |
| GET | `/clientes/:id` | token |
| POST | `/clientes` | token |
| PUT | `/clientes/:id` | token |
| DELETE | `/clientes/:id` | token |

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
| GET | `/relatorios/cliente/:id` | token |

---

# Regras de Negócio

- O usuário deve estar autenticado para acessar rotas protegidas.
- Não é permitido registrar vendas sem estoque disponível.
- O estoque é atualizado automaticamente após uma venda.
- Os campos obrigatórios são validados antes do processamento.
- Os dados enviados para a API são verificados antes de serem gravados no banco.

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
