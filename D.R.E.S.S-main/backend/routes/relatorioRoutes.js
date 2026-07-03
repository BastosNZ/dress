const express = require('express');
const router = express.Router();
const vendaService = require('../services/vendaService');
const { autenticar } = require('../middleware/auth');

router.use(autenticar);

router.get('/periodo', async (req, res) => {
  try {
    const { inicio, fim } = req.query;
    res.json(await vendaService.relatorioPorPeriodo(inicio, fim));
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

router.get('/cliente/:id', async (req, res) => {
  try {
    res.json(await vendaService.relatorioPorCliente(req.params.id));
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

module.exports = router;