const express = require('express');
const router = express.Router();
const usuarioService = require('../services/usuarioService');
const { autenticar, autorizar } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// Gestão de usuários é só pra ADMIN
router.use(autenticar, autorizar('ADMIN'));

router.get('/', asyncHandler(async (req, res) => {
  res.json(await usuarioService.listar());
}));

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await usuarioService.criar(req.body));
}));

router.patch('/:id/ativo', asyncHandler(async (req, res) => {
  res.json(await usuarioService.alterarAtivo(req.params.id, req.body.ativo, req.usuario.id));
}));

module.exports = router;
