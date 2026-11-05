const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository');
const AppError = require('../utils/AppError');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_dev';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

async function login(username, senha) {
  if (!username || !senha) {
    throw new AppError(400, 'Username e senha são obrigatórios');
  }

  const usuario = await usuarioRepository.findByUsername(username);
  if (!usuario || !usuario.is_active) {
    throw new AppError(401, 'Credenciais inválidas');
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    throw new AppError(401, 'Credenciais inválidas');
  }

  const token = jwt.sign(
    { id: usuario.id, username: usuario.username, perfil: usuario.perfil },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { token };
}

async function registrar({ username, senha, perfil }) {
  if (!username || !senha || !perfil) {
    throw new AppError(400, 'Username, senha e perfil são obrigatórios');
  }
  if (!['ADMIN', 'FUNCIONARIO'].includes(perfil)) {
    throw new AppError(400, 'Perfil deve ser ADMIN ou FUNCIONARIO');
  }

  const existente = await usuarioRepository.findByUsername(username);
  if (existente) {
    throw new AppError(409, 'Username já existe');
  }

  const hash = await bcrypt.hash(senha, 10);
  return usuarioRepository.create({ username, senha: hash, perfil });
}

module.exports = { login, registrar, JWT_SECRET };