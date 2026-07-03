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
- Bcrypt
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
│   └── D.R.E.S.S.sql
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
git clone https://github.com/JPACouto/D.R.E.S.S.git
```

Entre na pasta do projeto:

```bash
cd D.R.E.S.S/D.R.E.S.S-main
```

---

# Configurando o Banco de Dados

Crie um banco chamado:

```sql
CREATE DATABASE dress;
```

Depois importe o arquivo:

```
database/D.R.E.S.S.sql
```

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

# Autenticação

O sistema utiliza autenticação baseada em **JWT (JSON Web Token)**.

Após realizar o login, a API retorna um token que deve ser enviado nas rotas protegidas através do cabeçalho:

```http
Authorization: Bearer SEU_TOKEN
```

---

# Principais Endpoints

## Autenticação

| Método | Endpoint |
|---------|----------|
| POST | /login |

---

## Clientes

| Método | Endpoint |
|---------|----------|
| GET | /clientes |
| POST | /clientes |
| PUT | /clientes/:id |
| DELETE | /clientes/:id |

---

## Produtos

| Método | Endpoint |
|---------|----------|
| GET | /produtos |
| POST | /produtos |
| PUT | /produtos/:id |
| DELETE | /produtos/:id |

---

## Vendas

| Método | Endpoint |
|---------|----------|
| GET | /vendas |
| POST | /vendas |

---

## Relatórios

| Método | Endpoint |
|---------|----------|
| GET | /relatorios |

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
