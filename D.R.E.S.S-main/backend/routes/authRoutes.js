const express = require('express');
const router = express.Router();
const usuarioService = require('../services/usuarioService');
const { autenticar } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/login', asyncHandler(async (req, res) => {
  const { username, senha } = req.body;
  res.json(await usuarioService.login(username, senha));
}));

// Dados de quem está logado (o frontend usa pra mostrar o perfil)
router.get('/me', autenticar, (req, res) => {
  res.json(req.usuario);
});

router.put('/senha', autenticar, asyncHandler(async (req, res) => {
  const { senha_atual, nova_senha } = req.body;
  await usuarioService.alterarSenha(req.usuario.id, senha_atual, nova_senha);
  res.json({ mensagem: 'Senha alterada com sucesso' });
}));

module.exports = router;
