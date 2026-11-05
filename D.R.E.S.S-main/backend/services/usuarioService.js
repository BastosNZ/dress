const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository');
const AppError = require('../utils/AppError');
const { getJwtSecret, getJwtExpiresIn } = require('../config/jwt');

const PERFIS = ['ADMIN', 'FUNCIONARIO'];
const TAMANHO_MINIMO_SENHA = 6;

function validarSenha(senha) {
  if (typeof senha !== 'string' || senha.length < TAMANHO_MINIMO_SENHA) {
    throw new AppError(400, `A senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres`);
  }
}

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
    getJwtSecret(),
    { expiresIn: getJwtExpiresIn() }
  );

  return { token, usuario: { id: usuario.id, username: usuario.username, perfil: usuario.perfil } };
}

async function listar() {
  return usuarioRepository.findAll();
}

// Só ADMIN chega aqui (a rota já filtra). Antes era POST /auth/registrar
// público, e qualquer pessoa conseguia se cadastrar como ADMIN.
async function criar({ username, senha, perfil }) {
  if (!username || !senha || !perfil) {
    throw new AppError(400, 'Username, senha e perfil são obrigatórios');
  }
  if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) {
    throw new AppError(400, 'Username deve ter de 3 a 50 caracteres, sem espaços ou acentos');
  }
  if (!PERFIS.includes(perfil)) {
    throw new AppError(400, 'Perfil deve ser ADMIN ou FUNCIONARIO');
  }
  validarSenha(senha);

  const existente = await usuarioRepository.findByUsername(username);
  if (existente) {
    throw new AppError(409, 'Username já existe');
  }

  const hash = await bcrypt.hash(senha, 10);
  return usuarioRepository.create({ username, senha: hash, perfil });
}

async function alterarAtivo(id, ativo, idUsuarioLogado) {
  if (typeof ativo !== 'boolean') {
    throw new AppError(400, 'Envie "ativo" como true ou false');
  }

  const usuario = await usuarioRepository.findById(id);
  if (!usuario) {
    throw new AppError(404, 'Usuário não encontrado');
  }
  if (Number(id) === Number(idUsuarioLogado)) {
    throw new AppError(400, 'Você não pode desativar o próprio usuário');
  }

  // Não deixa o sistema ficar sem nenhum administrador
  if (!ativo && usuario.perfil === 'ADMIN' && usuario.is_active) {
    const admins = await usuarioRepository.countAdminsAtivos();
    if (admins <= 1) {
      throw new AppError(409, 'Não é possível desativar o último administrador ativo');
    }
  }

  return usuarioRepository.setAtivo(id, ativo);
}

async function alterarSenha(id, senhaAtual, novaSenha) {
  if (!senhaAtual || !novaSenha) {
    throw new AppError(400, 'Senha atual e nova senha são obrigatórias');
  }
  validarSenha(novaSenha);

  const hashAtual = await usuarioRepository.findSenhaById(id);
  const confere = hashAtual && await bcrypt.compare(senhaAtual, hashAtual);
  if (!confere) {
    throw new AppError(401, 'Senha atual incorreta');
  }

  const novoHash = await bcrypt.hash(novaSenha, 10);
  await usuarioRepository.updateSenha(id, novoHash);
}

module.exports = { login, listar, criar, alterarAtivo, alterarSenha };
