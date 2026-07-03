const db = require('../config/database');

async function findByUsername(username) {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
  return rows[0];
}

async function findById(id) {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  return rows[0];
}

async function create({ username, senha, perfil }) {
  const [result] = await db.query(
    'INSERT INTO usuarios (username, senha, perfil) VALUES (?, ?, ?)',
    [username, senha, perfil]
  );
  return { id: result.insertId, username, perfil };
}

module.exports = { findByUsername, findById, create };