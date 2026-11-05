const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { version } = require('../package.json');

// Usada pelo healthcheck do Docker e pelo smoke test do deploy.
// Pública de propósito: não devolve nada sensível, só se está de pé e a versão.
router.get('/', async (req, res) => {
  const versao = process.env.APP_VERSION || version;

  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', versao, banco: 'ok' });
  } catch (err) {
    // 503 = serviço indisponível: a API está viva mas sem banco
    res.status(503).json({ status: 'erro', versao, banco: 'indisponivel' });
  }
});

module.exports = router;
