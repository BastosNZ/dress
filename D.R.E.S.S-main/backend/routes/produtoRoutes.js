const express = require('express');
const router = express.Router();
const produtoService = require('../services/produtoService');
const { autenticar, autorizar } = require('../middleware/auth');

router.use(autenticar);

router.get('/', async (req, res) => {
  try {
    res.json(await produtoService.listar());
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    res.json(await produtoService.buscarPorId(req.params.id));
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

router.post('/', async (req, res) => {
  try {
    res.status(201).json(await produtoService.criar(req.body));
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    res.json(await produtoService.atualizar(req.params.id, req.body));
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

router.delete('/:id', autorizar('ADMIN'), async (req, res) => {
  try {
    await produtoService.remover(req.params.id);
    res.json({ mensagem: 'Produto removido com sucesso' });
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

module.exports = router;