const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt');
const usuarioRepository = require('../repositories/usuarioRepository');

async function autenticar(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = header.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }

  try {
    // Busca o usuário de novo no banco: se foi desativado depois do login,
    // o token antigo para de funcionar na hora (e o perfil vem sempre atualizado)
    const usuario = await usuarioRepository.findById(payload.id);
    if (!usuario || !usuario.is_active) {
      return res.status(401).json({ erro: 'Usuário inativo ou inexistente' });
    }

    req.usuario = { id: usuario.id, username: usuario.username, perfil: usuario.perfil };
    next();
  } catch (err) {
    next(err);
  }
}

function autorizar(...perfis) {
  return (req, res, next) => {
    if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
      return res.status(403).json({ erro: 'Acesso não autorizado para este perfil' });
    }
    next();
  };
}

module.exports = { autenticar, autorizar };
