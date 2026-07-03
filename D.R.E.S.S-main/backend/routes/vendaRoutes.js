const express = require('express');
const router = express.Router();
const vendaService = require('../services/vendaService');
const { autenticar } = require('../middleware/auth');

router.use(autenticar);

router.get('/', async (req, res) => {
  try {
    res.json(await vendaService.listar());
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    res.json(await vendaService.buscarPorId(req.params.id));
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

router.post('/', async (req, res) => {
  try {
    const venda = await vendaService.registrar({
      id_usuario: req.usuario.id,
      id_cliente: req.body.id_cliente,
      itens: req.body.itens,
    });
    res.status(201).json(venda);
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

module.exports = router;