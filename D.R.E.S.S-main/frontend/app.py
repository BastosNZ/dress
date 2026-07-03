import streamlit as st
import requests
import pandas as pd
from datetime import date

API_URL = "http://localhost:3000"

st.set_page_config(
    page_title="D.R.E.S.S | Painel Administrativo",
    page_icon="D",
    layout="wide"
)

# ---------------- CSS ----------------

st.markdown("""
<style>
.stApp {
    background-color: #0f172a;
    color: #e5e7eb;
}

.block-container {
    padding-top: 2rem;
    padding-bottom: 2rem;
    max-width: 1450px;
}

[data-testid="stHeader"] {
    background-color: #0f172a;
}

[data-testid="stSidebar"] {
    background-color: #111827;
    border-right: 1px solid #1f2937;
}

[data-testid="stSidebar"] * {
    color: #f9fafb;
}

.page-title {
    font-size: 34px;
    font-weight: 700;
    color: #f9fafb;
    margin-bottom: 0px;
}

.page-subtitle {
    color: #94a3b8;
    font-size: 15px;
    margin-bottom: 24px;
}

.kpi-card,
.section-card,
.product-card,
.login-card {
    background: #111827;
    border: 1px solid #243044;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.25);
}

.kpi-label {
    color: #94a3b8;
    font-size: 14px;
    font-weight: 500;
}

.kpi-value {
    color: #f9fafb;
    font-size: 32px;
    font-weight: 700;
    margin-top: 8px;
}

.product-title {
    font-size: 19px;
    font-weight: 700;
    color: #f9fafb;
}

.product-description {
    color: #cbd5e1;
    font-size: 14px;
    min-height: 42px;
}

.price {
    font-size: 24px;
    font-weight: 700;
    color: #f9fafb;
}

.badge-ok {
    background-color: rgba(34,197,94,0.15);
    color: #86efac;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
}

.badge-alert {
    background-color: rgba(239,68,68,0.15);
    color: #fca5a5;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
}

.login-title {
    font-size: 34px;
    font-weight: 800;
    color: #f9fafb;
    margin-bottom: 4px;
}

.login-subtitle {
    color: #94a3b8;
    font-size: 15px;
    margin-bottom: 24px;
}

hr {
    border-color: #243044;
}

.stButton button {
    background-color: #2563eb;
    color: white;
    border-radius: 10px;
    border: 1px solid #2563eb;
    font-weight: 600;
}

.stButton button:hover {
    background-color: #1d4ed8;
    color: white;
    border: 1px solid #1d4ed8;
}

[data-testid="stDataFrame"] {
    background-color: #111827;
    border-radius: 12px;
}

.stTextInput input,
.stTextArea textarea,
.stNumberInput input,
.stDateInput input {
    background-color: #111827;
    color: #f9fafb;
    border: 1px solid #374151;
}

.stSelectbox div[data-baseweb="select"] > div {
    background-color: #111827;
    color: #f9fafb;
    border-color: #374151;
}
</style>
""", unsafe_allow_html=True)

# ---------------- HELPERS ----------------

def fix_text(value):
    if isinstance(value, str):
        try:
            return value.encode("latin1").decode("utf-8")
        except Exception:
            return value
    return value


def fix_data(data):
    if isinstance(data, list):
        return [{k: fix_text(v) for k, v in item.items()} for item in data]
    if isinstance(data, dict):
        return {k: fix_text(v) for k, v in data.items()}
    return data


def money(value):
    try:
        return f"R$ {float(value):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    except Exception:
        return "R$ 0,00"


def auth_headers():
    return {"Authorization": f"Bearer {st.session_state.token}"}


def api_get(endpoint):
    try:
        r = requests.get(f"{API_URL}{endpoint}", headers=auth_headers(), timeout=10)
        r.encoding = "utf-8"

        if r.status_code == 200:
            return fix_data(r.json())

        st.error(r.json().get("erro", "Erro na requisição"))
        return []
    except Exception as e:
        st.error(f"Erro ao conectar com o backend: {e}")
        return []


def api_post(endpoint, data):
    try:
        r = requests.post(f"{API_URL}{endpoint}", json=data, headers=auth_headers(), timeout=10)
        r.encoding = "utf-8"

        if r.status_code in [200, 201]:
            st.success("Registro salvo com sucesso.")
            resultado = fix_data(r.json())
            st.rerun()
            return resultado

        st.error(r.json().get("erro", "Erro ao salvar"))
        return None
    except Exception as e:
        st.error(f"Erro ao conectar com o backend: {e}")
        return None


def api_put(endpoint, data):
    try:
        r = requests.put(f"{API_URL}{endpoint}", json=data, headers=auth_headers(), timeout=10)
        r.encoding = "utf-8"

        if r.status_code == 200:
            st.success("Registro atualizado com sucesso.")
            resultado = fix_data(r.json())
            st.rerun()
            return resultado

        st.error(r.json().get("erro", "Erro ao atualizar"))
        return None
    except Exception as e:
        st.error(f"Erro ao conectar com o backend: {e}")
        return None


def api_delete(endpoint):
    try:
        r = requests.delete(f"{API_URL}{endpoint}", headers=auth_headers(), timeout=10)
        r.encoding = "utf-8"

        if r.status_code == 200:
            st.success("Registro removido com sucesso.")
            st.rerun()
            return True

        st.error(r.json().get("erro", "Erro ao remover"))
        return False
    except Exception as e:
        st.error(f"Erro ao conectar com o backend: {e}")
        return False


def page_header(title, subtitle):
    st.markdown(f'<div class="page-title">{title}</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="page-subtitle">{subtitle}</div>', unsafe_allow_html=True)


def kpi_card(label, value):
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-label">{label}</div>
        <div class="kpi-value">{value}</div>
    </div>
    """, unsafe_allow_html=True)


# ---------------- LOGIN ----------------

if "token" not in st.session_state:
    st.session_state.token = None

if not st.session_state.token:
    st.markdown("<br><br>", unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1.25, 1, 1.25])

    with col2:
        st.markdown("""
        <div class="login-card">
            <div class="login-title">D.R.E.S.S</div>
            <div class="login-subtitle">Painel administrativo para gestão de loja</div>
        </div>
        """, unsafe_allow_html=True)

        st.write("")
        username = st.text_input("Usuário", placeholder="Digite seu usuário")
        senha = st.text_input("Senha", type="password", placeholder="Digite sua senha")

        entrar = st.button("Entrar no sistema", use_container_width=True)
        st.caption("Acesso restrito a usuários cadastrados.")

        if entrar:
            try:
                r = requests.post(
                    f"{API_URL}/auth/login",
                    json={"username": username, "senha": senha},
                    timeout=10
                )
                r.encoding = "utf-8"

                if r.status_code == 200:
                    st.session_state.token = r.json().get("token")
                    st.rerun()
                else:
                    st.error(r.json().get("erro", "Login inválido"))
            except Exception as e:
                st.error(f"Erro ao conectar com o backend: {e}")

    st.stop()


# ---------------- SIDEBAR ----------------

st.sidebar.markdown("## D.R.E.S.S")
st.sidebar.caption("Painel administrativo")
st.sidebar.divider()

pagina = st.sidebar.radio(
    "Menu",
    ["Dashboard", "Produtos", "Clientes", "Vendas", "Relatórios"]
)

st.sidebar.divider()
st.sidebar.caption("Ambiente")
st.sidebar.write("API Express")
st.sidebar.write("Banco MySQL")

if st.sidebar.button("Sair", use_container_width=True):
    st.session_state.token = None
    st.rerun()


# ---------------- DASHBOARD ----------------

if pagina == "Dashboard":
    page_header("Dashboard", "Resumo operacional da loja")

    produtos = api_get("/produtos")
    clientes = api_get("/clientes")
    vendas = api_get("/vendas")

    faturamento = sum(float(v.get("valor_total") or 0) for v in vendas)

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        kpi_card("Produtos cadastrados", len(produtos))
    with col2:
        kpi_card("Clientes ativos", len(clientes))
    with col3:
        kpi_card("Vendas registradas", len(vendas))
    with col4:
        kpi_card("Faturamento", money(faturamento))

    st.divider()

    colA, colB = st.columns([1.45, 1])

    with colA:
        st.subheader("Estoque atual")

        if produtos:
            df = pd.DataFrame(produtos)
            colunas = ["nome", "preco", "quantidade_estoque", "estoque_minimo"]
            df = df[[c for c in colunas if c in df.columns]]

            df = df.rename(columns={
                "nome": "Produto",
                "preco": "Preço",
                "quantidade_estoque": "Estoque",
                "estoque_minimo": "Mínimo"
            })

            if "Preço" in df.columns:
                df["Preço"] = df["Preço"].apply(money)

            st.dataframe(df, use_container_width=True, hide_index=True)
        else:
            st.info("Nenhum produto cadastrado.")

    with colB:
        st.subheader("Atenção de estoque")

        baixos = []
        for p in produtos:
            estoque = int(p.get("quantidade_estoque") or 0)
            minimo = int(p.get("estoque_minimo") or 0)

            if estoque <= minimo:
                baixos.append({
                    "Produto": p.get("nome"),
                    "Estoque": estoque,
                    "Mínimo": minimo
                })

        if baixos:
            st.warning("Existem produtos abaixo do estoque mínimo.")
            st.dataframe(pd.DataFrame(baixos), use_container_width=True, hide_index=True)
        else:
            st.success("Todos os produtos estão acima do estoque mínimo.")


# ---------------- PRODUTOS ----------------

elif pagina == "Produtos":
    page_header("Produtos", "Controle de catálogo, preços e estoque")

    aba1, aba2, aba3 = st.tabs(["Catálogo", "Cadastrar", "Editar / Excluir"])

    with aba1:
        produtos = api_get("/produtos")
        busca = st.text_input("Buscar produto", placeholder="Digite o nome do produto")

        if busca:
            produtos = [
                p for p in produtos
                if busca.lower() in str(p.get("nome", "")).lower()
            ]

        if produtos:
            cols = st.columns(3)

            for i, p in enumerate(produtos):
                nome = p.get("nome", "")
                descricao = p.get("descricao", "")
                preco = p.get("preco", 0)
                estoque = int(p.get("quantidade_estoque") or 0)
                minimo = int(p.get("estoque_minimo") or 0)

                badge_class = "badge-alert" if estoque <= minimo else "badge-ok"
                badge_text = "Estoque baixo" if estoque <= minimo else "Estoque adequado"

                with cols[i % 3]:
                    st.markdown(f"""
                    <div class="product-card">
                        <div class="product-title">{nome}</div>
                        <p class="product-description">{descricao}</p>
                        <div class="price">{money(preco)}</div>
                        <p>Estoque: <b>{estoque}</b> unidades</p>
                        <span class="{badge_class}">{badge_text}</span>
                    </div>
                    """, unsafe_allow_html=True)
        else:
            st.info("Nenhum produto encontrado.")

    with aba2:
        st.subheader("Novo produto")

        col1, col2 = st.columns(2)

        with col1:
            nome = st.text_input("Nome")
            preco = st.number_input("Preço", min_value=0.0, step=1.0)

        with col2:
            quantidade = st.number_input("Quantidade em estoque", min_value=0, step=1)
            minimo = st.number_input("Estoque mínimo", min_value=0, step=1)

        descricao = st.text_area("Descrição")

        if st.button("Salvar produto", use_container_width=True):
            api_post("/produtos", {
                "nome": nome,
                "descricao": descricao,
                "preco": preco,
                "quantidade_estoque": quantidade,
                "estoque_minimo": minimo
            })

    with aba3:
        produtos = api_get("/produtos")

        if produtos:
            opcoes = {f"{p.get('id')} - {p.get('nome')}": p for p in produtos}
            escolha = st.selectbox("Produto", list(opcoes.keys()))
            produto = opcoes[escolha]

            col1, col2 = st.columns(2)

            with col1:
                nome = st.text_input("Nome do produto", produto.get("nome", ""))
                preco = st.number_input("Preço do produto", value=float(produto.get("preco", 0)))

            with col2:
                qtd = st.number_input("Quantidade", value=int(produto.get("quantidade_estoque", 0)))
                minimo = st.number_input("Estoque mínimo", value=int(produto.get("estoque_minimo", 0)))

            descricao = st.text_area("Descrição do produto", produto.get("descricao", ""))

            colA, colB = st.columns(2)

            with colA:
                if st.button("Atualizar produto", use_container_width=True):
                    api_put(f"/produtos/{produto.get('id')}", {
                        "nome": nome,
                        "descricao": descricao,
                        "preco": preco,
                        "quantidade_estoque": qtd,
                        "estoque_minimo": minimo
                    })

            with colB:
                if st.button("Excluir produto", use_container_width=True):
                    api_delete(f"/produtos/{produto.get('id')}")
        else:
            st.info("Nenhum produto cadastrado.")


# ---------------- CLIENTES ----------------

elif pagina == "Clientes":
    page_header("Clientes", "Cadastro e manutenção da base de clientes")

    aba1, aba2, aba3 = st.tabs(["Lista", "Cadastrar", "Editar / Excluir"])

    with aba1:
        clientes = api_get("/clientes")
        busca = st.text_input("Buscar cliente", placeholder="Digite o nome do cliente")

        if clientes:
            df = pd.DataFrame(clientes)

            if busca and "nome" in df.columns:
                df = df[df["nome"].str.contains(busca, case=False, na=False)]

            st.dataframe(df, use_container_width=True, hide_index=True)
        else:
            st.info("Nenhum cliente cadastrado.")

    with aba2:
        st.subheader("Novo cliente")

        col1, col2 = st.columns(2)

        with col1:
            nome = st.text_input("Nome")
            cpf = st.text_input("CPF")

        with col2:
            email = st.text_input("Email")
            telefone = st.text_input("Telefone")

        endereco = st.text_input("Endereço")

        if st.button("Salvar cliente", use_container_width=True):
            api_post("/clientes", {
                "nome": nome,
                "cpf": cpf,
                "email": email,
                "telefone": telefone,
                "endereco": endereco
            })

    with aba3:
        clientes = api_get("/clientes")

        if clientes:
            opcoes = {f"{c.get('id')} - {c.get('nome')}": c for c in clientes}
            escolha = st.selectbox("Cliente", list(opcoes.keys()))
            cliente = opcoes[escolha]

            col1, col2 = st.columns(2)

            with col1:
                nome = st.text_input("Nome do cliente", cliente.get("nome", ""))
                cpf = st.text_input("CPF do cliente", cliente.get("cpf", ""))

            with col2:
                email = st.text_input("Email do cliente", cliente.get("email", ""))
                telefone = st.text_input("Telefone do cliente", cliente.get("telefone", ""))

            endereco = st.text_input("Endereço do cliente", cliente.get("endereco", ""))

            colA, colB = st.columns(2)

            with colA:
                if st.button("Atualizar cliente", use_container_width=True):
                    api_put(f"/clientes/{cliente.get('id')}", {
                        "nome": nome,
                        "cpf": cpf,
                        "email": email,
                        "telefone": telefone,
                        "endereco": endereco
                    })

            with colB:
                if st.button("Excluir cliente", use_container_width=True):
                    api_delete(f"/clientes/{cliente.get('id')}")
        else:
            st.info("Nenhum cliente cadastrado.")


# ---------------- VENDAS ----------------

elif pagina == "Vendas":
    page_header("Vendas", "Registro e acompanhamento de vendas")

    aba1, aba2 = st.tabs(["Histórico", "Nova venda"])

    with aba1:
        vendas = api_get("/vendas")
        clientes = api_get("/clientes")

        clientes_por_id = {
            c.get("id"): c.get("nome")
            for c in clientes
        }

        if vendas:
            linhas = []

            for venda in vendas:
                data_formatada = venda.get("data", "")

                try:
                    dt = pd.to_datetime(data_formatada)

                    if dt.tzinfo is None:
                        dt = dt.tz_localize("UTC")

                    data_formatada = (
                        dt.tz_convert("America/Sao_Paulo")
                          .strftime("%d/%m/%Y %H:%M")
                    )
                except Exception:
                    pass

                venda_id = venda.get("id")
                try:
                    venda_label = f"#{int(venda_id):03d}"
                except Exception:
                    venda_label = f"#{venda_id}"

                linhas.append({
                    "Venda": venda_label,
                    "Cliente": clientes_por_id.get(
                        venda.get("id_cliente"),
                        f"Cliente {venda.get('id_cliente')}"
                    ),
                    "Data": data_formatada,
                    "Valor total": money(venda.get("valor_total", 0))
                })

            df = pd.DataFrame(linhas)
            st.dataframe(df, use_container_width=True, hide_index=True)
        else:
            st.info("Nenhuma venda registrada.")

    with aba2:
        clientes = api_get("/clientes")
        produtos = api_get("/produtos")

        if not clientes or not produtos:
            st.warning("É necessário ter clientes e produtos cadastrados para registrar uma venda.")
        else:
            col1, col2, col3 = st.columns(3)

            clientes_opcoes = {f"{c.get('id')} - {c.get('nome')}": c for c in clientes}
            produtos_opcoes = {f"{p.get('id')} - {p.get('nome')}": p for p in produtos}

            with col1:
                cliente_key = st.selectbox("Cliente", list(clientes_opcoes.keys()))

            with col2:
                produto_key = st.selectbox("Produto", list(produtos_opcoes.keys()))

            with col3:
                quantidade = st.number_input("Quantidade", min_value=1, step=1)

            produto = produtos_opcoes[produto_key]
            total_previsto = float(produto.get("preco", 0)) * quantidade

            st.info(f"Total previsto da venda: {money(total_previsto)}")

            if st.button("Registrar venda", use_container_width=True):
                cliente = clientes_opcoes[cliente_key]

                api_post("/vendas", {
                    "id_cliente": cliente.get("id"),
                    "itens": [
                        {
                            "id_produto": produto.get("id"),
                            "quantidade": quantidade
                        }
                    ]
                })


# ---------------- RELATÓRIOS ----------------

elif pagina == "Relatórios":
    page_header("Relatórios", "Consultas gerenciais por período")

    col1, col2 = st.columns(2)

    with col1:
        inicio = st.date_input("Data inicial", value=date.today())

    with col2:
        fim = st.date_input("Data final", value=date.today())

    if st.button("Gerar relatório", use_container_width=True):
        relatorio = api_get(f"/relatorios/periodo?inicio={inicio}&fim={fim}")

        if relatorio:
            df = pd.DataFrame(relatorio)
            st.dataframe(df, use_container_width=True, hide_index=True)

            numeric_cols = df.select_dtypes(include="number").columns
            if len(numeric_cols) > 0:
                st.bar_chart(df[numeric_cols])
        else:
            st.info("Nenhum dado encontrado para o período selecionado.")