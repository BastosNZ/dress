require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const initDatabase = require('./config/initDatabase');
const errorHandler = require('./middleware/errorHandler');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const vendaRoutes = require('./routes/vendaRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/clientes', clienteRoutes);
app.use('/produtos', produtoRoutes);
app.use('/vendas', vendaRoutes);
app.use('/relatorios', relatorioRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tem que ficar depois de todas as rotas
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  if (!process.env.JWT_SECRET) {
    console.error('Defina JWT_SECRET no arquivo .env (veja o .env.example).');
    process.exit(1);
  }

  initDatabase()
    .then(() => {
      const server = app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

      // O "docker stop" manda SIGTERM. Sem isso o Node ignora o sinal e o
      // Docker espera 10s antes de matar o processo na força.
      const desligar = (sinal) => {
        console.log(`${sinal} recebido, desligando...`);
        server.close(() => {
          db.end().finally(() => process.exit(0));
        });
      };
      process.on('SIGTERM', desligar);
      process.on('SIGINT', desligar);
    })
    .catch((error) => {
      console.error('Erro ao inicializar banco:', error.message);
      process.exit(1);
    });
}

module.exports = app;
