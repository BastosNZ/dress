const db = require('../config/database');

async function findAll() {
  const [rows] = await db.query('SELECT * FROM produtos');
  return rows;
}

async function findById(id) {
  const [rows] = await db.query('SELECT * FROM produtos WHERE id = ?', [id]);
  return rows[0];
}

async function create(produto) {
  const { nome, descricao, preco, quantidade_estoque, estoque_minimo } = produto;
  const [result] = await db.query(
    'INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, estoque_minimo) VALUES (?, ?, ?, ?, ?)',
    [nome, descricao || null, preco, quantidade_estoque || 0, estoque_minimo || 0]
  );
  return { id: result.insertId, ...produto };
}

async function update(id, produto) {
  const atual = await findById(id);
  const dados = { ...atual, ...produto };
  await db.query(
    'UPDATE produtos SET nome=?, descricao=?, preco=?, quantidade_estoque=?, estoque_minimo=? WHERE id=?',
    [dados.nome, dados.descricao, dados.preco, dados.quantidade_estoque, dados.estoque_minimo, id]
  );
  return findById(id);
}

async function remove(id) {
  await db.query('DELETE FROM produtos WHERE id = ?', [id]);
}

module.exports = { findAll, findById, create, update, remove };