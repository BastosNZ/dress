const db = require('../config/database');

// Nunca devolve a coluna senha pra fora do repository, exceto no findByUsername (login)
const CAMPOS_PUBLICOS = 'id, username, perfil, is_active';

async function findAll() {
  const [rows] = await db.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios ORDER BY username`);
  return rows;
}

async function findByUsername(username) {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
  return rows[0];
}

async function findById(id) {
  const [rows] = await db.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = ?`, [id]);
  return rows[0];
}

async function findSenhaById(id) {
  const [rows] = await db.query('SELECT senha FROM usuarios WHERE id = ?', [id]);
  return rows[0] ? rows[0].senha : undefined;
}

async function create({ username, senha, perfil }) {
  const [result] = await db.query(
    'INSERT INTO usuarios (username, senha, perfil) VALUES (?, ?, ?)',
    [username, senha, perfil]
  );
  return { id: result.insertId, username, perfil, is_active: 1 };
}

async function setAtivo(id, ativo) {
  await db.query('UPDATE usuarios SET is_active = ? WHERE id = ?', [ativo, id]);
  return findById(id);
}

async function updateSenha(id, senhaHash) {
  await db.query('UPDATE usuarios SET senha = ? WHERE id = ?', [senhaHash, id]);
}

async function countAdminsAtivos() {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS total FROM usuarios WHERE perfil = 'ADMIN' AND is_active = TRUE"
  );
  return rows[0].total;
}

module.exports = {
  findAll,
  findByUsername,
  findById,
  findSenhaById,
  create,
  setAtivo,
  updateSenha,
  countAdminsAtivos,
};
