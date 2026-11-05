// Antes tinha um fallback 'segredo_dev' aqui. Se alguém esquecesse o .env,
// a API subia com um segredo que está no GitHub e qualquer um gerava token de ADMIN.
// Agora sem JWT_SECRET o servidor nem sobe (ver server.js).
function getJwtSecret() {
  const segredo = process.env.JWT_SECRET;
  if (!segredo) {
    throw new Error('JWT_SECRET não definido no .env');
  }
  return segredo;
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || '1h';
}

module.exports = { getJwtSecret, getJwtExpiresIn };
