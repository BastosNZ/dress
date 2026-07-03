const express = require('express');
const router = express.Router();
const usuarioService = require('../services/usuarioService');

router.post('/login', async (req, res) => {
  try {
    const { username, senha } = req.body;
    const resultado = await usuarioService.login(username, senha);
    res.json(resultado);
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

router.post('/registrar', async (req, res) => {
  try {
    const usuario = await usuarioService.registrar(req.body);
    res.status(201).json(usuario);
  } catch (err) {
    res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
  }
});

module.exports = router;