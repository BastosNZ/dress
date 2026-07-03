const db = require('../config/database');

async function findAll() {
  const [rows] = await db.query('SELECT * FROM clientes');
  return rows;
}

async function findById(id) {
  const [rows] = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
  return rows[0];
}

async function findByCpf(cpf) {
  const [rows] = await db.query('SELECT * FROM clientes WHERE cpf = ?', [cpf]);
  return rows[0];
}

async function create(cliente) {
  const { nome, cpf, email, telefone, endereco } = cliente;
  const [result] = await db.query(
    'INSERT INTO clientes (nome, cpf, email, telefone, endereco) VALUES (?, ?, ?, ?, ?)',
    [nome, cpf, email, telefone || null, endereco || null]
  );
  return { id: result.insertId, ...cliente };
}

async function update(id, cliente) {
  const atual = await findById(id);
  const dados = { ...atual, ...cliente };
  await db.query(
    'UPDATE clientes SET nome=?, cpf=?, email=?, telefone=?, endereco=? WHERE id=?',
    [dados.nome, dados.cpf, dados.email, dados.telefone, dados.endereco, id]
  );
  return findById(id);
}

async function remove(id) {
  await db.query('DELETE FROM clientes WHERE id = ?', [id]);
}

async function hasVendas(id) {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM vendas WHERE id_cliente = ?', [id]);
  return rows[0].total > 0;
}

module.exports = { findAll, findById, findByCpf, create, update, remove, hasVendas };