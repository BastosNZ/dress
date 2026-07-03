const db = require('../config/database');

async function findAll() {
  const [rows] = await db.query('SELECT * FROM vendas ORDER BY data DESC');
  return rows;
}

async function findById(id) {
  const [rows] = await db.query('SELECT * FROM vendas WHERE id = ?', [id]);
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
    'SELECT * FROM vendas WHERE data BETWEEN ? AND ? ORDER BY data',
    [inicio, fim]
  );
  return rows;
}

async function findByCliente(idCliente) {
  const [rows] = await db.query('SELECT * FROM vendas WHERE id_cliente = ? ORDER BY data DESC', [idCliente]);
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

    let valorTotal = 0;

    for (const item of itens) {
      const [produtoRows] = await conn.query('SELECT * FROM produtos WHERE id = ? FOR UPDATE', [item.id_produto]);
      const produto = produtoRows[0];

      if (!produto) {
        throw new Error(`Produto ${item.id_produto} não encontrado`);
      }
      if (produto.quantidade_estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para o produto "${produto.nome}"`);
      }

      const subtotal = item.quantidade * Number(produto.preco);
      valorTotal += subtotal;

      await conn.query(
        'INSERT INTO itens_venda (id_venda, id_produto, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
        [idVenda, item.id_produto, item.quantidade, produto.preco]
      );

      await conn.query(
        'UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
        [item.quantidade, item.id_produto]
      );
    }

    await conn.query('UPDATE vendas SET valor_total = ? WHERE id = ?', [valorTotal, idVenda]);

    await conn.commit();
    conn.release();
    return findById(idVenda);
  } catch (err) {
    await conn.rollback();
    conn.release();
    throw err;
  }
}

module.exports = { findAll, findById, findByPeriodo, findByCliente, create };