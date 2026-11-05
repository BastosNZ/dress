const express = require('express');
const router = express.Router();
const clienteService = require('../services/clienteService');
const { autenticar } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

router.use(autenticar);

router.get('/', asyncHandler(async (req, res) => {
  res.json(await clienteService.listar());
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json(await clienteService.buscarPorId(req.params.id));
}));

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await clienteService.criar(req.body));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  res.json(await clienteService.atualizar(req.params.id, req.body));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await clienteService.remover(req.params.id);
  res.json({ mensagem: 'Cliente removido com sucesso' });
}));

module.exports = router;
