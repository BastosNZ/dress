const express = require('express');
const router = express.Router();
const usuarioService = require('../services/usuarioService');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/login', asyncHandler(async (req, res) => {
  const { username, senha } = req.body;
  res.json(await usuarioService.login(username, senha));
}));

router.post('/registrar', asyncHandler(async (req, res) => {
  res.status(201).json(await usuarioService.registrar(req.body));
}));

module.exports = router;
