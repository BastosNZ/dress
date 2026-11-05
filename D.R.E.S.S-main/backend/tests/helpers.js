const jwt = require('jsonwebtoken');

// Gera um token igual ao do login, pra não precisar bater no banco nos testes
function tokenDe(usuario) {
  return jwt.sign(
    { id: usuario.id, username: usuario.username, perfil: usuario.perfil },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

const admin = { id: 1, username: 'admin', perfil: 'ADMIN', is_active: 1 };
const funcionario = { id: 2, username: 'maria', perfil: 'FUNCIONARIO', is_active: 1 };

module.exports = { tokenDe, admin, funcionario };
