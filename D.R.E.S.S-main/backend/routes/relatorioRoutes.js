const express = require('express');
const router = express.Router();
const vendaService = require('../services/vendaService');
const { autenticar } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

router.use(autenticar);

router.get('/periodo', asyncHandler(async (req, res) => {
  const { inicio, fim } = req.query;
  res.json(await vendaService.relatorioPorPeriodo(inicio, fim));
}));

// Totais do período: quantidade de vendas, faturamento e ticket médio
router.get('/resumo', asyncHandler(async (req, res) => {
  const { inicio, fim } = req.query;
  res.json(await vendaService.resumoPorPeriodo(inicio, fim));
}));

router.get('/cliente/:id', asyncHandler(async (req, res) => {
  res.json(await vendaService.relatorioPorCliente(req.params.id));
}));

module.exports = router;
