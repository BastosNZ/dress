const express = require('express');
const router = express.Router();
const vendaService = require('../services/vendaService');
const { autenticar } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

router.use(autenticar);

router.get('/', asyncHandler(async (req, res) => {
  res.json(await vendaService.listar());
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json(await vendaService.buscarPorId(req.params.id));
}));

router.post('/', asyncHandler(async (req, res) => {
  const venda = await vendaService.registrar({
    id_usuario: req.usuario.id,
    id_cliente: req.body.id_cliente,
    itens: req.body.itens,
  });
  res.status(201).json(venda);
}));

module.exports = router;
