const db = require('../config/database');
const AppError = require('../utils/AppError');

// Já traz o nome do cliente e de quem vendeu, pro frontend não precisar cruzar
const SELECT_VENDAS = `
  SELECT v.*, c.nome AS cliente_nome, u.username AS vendedor
  FROM vendas v
  JOIN clientes c ON c.id = v.id_cliente
  JOIN usuarios u ON u.id = v.id_usuario
`;

// Período sempre inclusivo nos dois dias: "fim" vira "antes do dia seguinte".
// Com BETWEEN '2026-11-05' AND '2026-11-05' só entrava venda feita às 00:00:00.
const FILTRO_PERIODO = 'v.data >= ? AND v.data < DATE_ADD(?, INTERVAL 1 DAY)';

async function findAll() {
  const [rows] = await db.query(`${SELECT_VENDAS} ORDER BY v.data DESC`);
  return rows;
}

async function findById(id) {
  const [rows] = await db.query(`${SELECT_VENDAS} WHERE v.id = ?`, [id]);
  const venda = rows[0];
  if (!venda) return null;

  const [itens] = await db.query(
    `SELECT iv.*, p.nome AS produto_nome
     FROM itens_venda iv
     JOIN produtos p ON p.id = iv.id_produto
     WHERE iv.id_venda = ?`,
    [id]
  );
  venda.itens = itens;
  return venda;
}

async function findByPeriodo(inicio, fim) {
  const [rows] = await db.query(
    `${SELECT_VENDAS} WHERE ${FILTRO_PERIODO} ORDER BY v.data`,
    [inicio, fim]
  );
  return rows;
}

async function resumoPorPeriodo(inicio, fim) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS total_vendas, COALESCE(SUM(v.valor_total), 0) AS faturamento
     FROM vendas v
     WHERE ${FILTRO_PERIODO}`,
    [inicio, fim]
  );
  // o mysql2 devolve SUM de DECIMAL como texto
  return {
    total_vendas: Number(rows[0].total_vendas),
    faturamento: Number(rows[0].faturamento),
  };
}

async function findByCliente(idCliente) {
  const [rows] = await db.query(`${SELECT_VENDAS} WHERE v.id_cliente = ? ORDER BY v.data DESC`, [idCliente]);
  return rows;
}

async function create({ id_usuario, id_cliente, itens }) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [vendaResult] = await conn.query(
      'INSERT INTO vendas (id_usuario, id_cliente, valor_total) VALUES (?, ?, 0)',
      [id_usuario, id_cliente]
    );
    const idVenda = vendaResult.insertId;

    for (const item of itens) {
      // FOR UPDATE trava a linha do produto até o commit, então duas vendas
      // ao mesmo tempo não conseguem vender a mesma última peça
      const [produtoRows] = await conn.query('SELECT * FROM produtos WHERE id = ? FOR UPDATE', [item.id_produto]);
      const produto = produtoRows[0];

      if (!produto) {
        throw new AppError(404, `Produto ${item.id_produto} não encontrado`);
      }
      if (produto.quantidade_estoque < item.quantidade) {
        throw new AppError(400, `Estoque insuficiente para o produto "${produto.nome}"`);
      }

      await conn.query(
        'INSERT INTO itens_venda (id_venda, id_produto, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
        [idVenda, item.id_produto, item.quantidade, produto.preco]
      );

      await conn.query(
        'UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
        [item.quantidade, item.id_produto]
      );
    }

    // O total sai da soma dos itens que foram gravados de verdade.
    // Antes era somado no JavaScript e podia ficar diferente dos itens.
    await conn.query(
      `UPDATE vendas
       SET valor_total = (SELECT SUM(subtotal) FROM itens_venda WHERE id_venda = ?)
       WHERE id = ?`,
      [idVenda, idVenda]
    );

    await conn.commit();
    conn.release();
    return findById(idVenda);
  } catch (err) {
    await conn.rollback();
    conn.release();
    throw err;
  }
}

module.exports = { findAll, findById, findByPeriodo, resumoPorPeriodo, findByCliente, create };
