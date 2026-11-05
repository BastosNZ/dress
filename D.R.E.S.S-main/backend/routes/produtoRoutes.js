const express = require('express');
const router = express.Router();
const produtoService = require('../services/produtoService');
const { autenticar, autorizar } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

router.use(autenticar);

router.get('/', asyncHandler(async (req, res) => {
  res.json(await produtoService.listar());
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json(await produtoService.buscarPorId(req.params.id));
}));

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await produtoService.criar(req.body));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  res.json(await produtoService.atualizar(req.params.id, req.body));
}));

router.delete('/:id', autorizar('ADMIN'), asyncHandler(async (req, res) => {
  await produtoService.remover(req.params.id);
  res.json({ mensagem: 'Produto removido com sucesso' });
}));

module.exports = router;
