const express = require('express');
const router = express.Router();
const clienteService = require('../services/clienteService');
const { autenticar } = require('../middleware/auth');

router.use(autenticar);

router.get('/', async (req, res) => {
  try {
    res.json(await clienteService.listar());
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    res.json(await clienteService.buscarPorId(req.params.id));
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

router.post('/', async (req, res) => {
  try {
    res.status(201).json(await clienteService.criar(req.body));
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    res.json(await clienteService.atualizar(req.params.id, req.body));
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await clienteService.remover(req.params.id);
    res.json({ mensagem: 'Cliente removido com sucesso' });
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

module.exports = router;