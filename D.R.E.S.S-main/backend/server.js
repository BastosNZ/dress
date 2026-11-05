require('dotenv').config();

const express = require('express');
const cors = require('cors');
const initDatabase = require('./config/initDatabase');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const vendaRoutes = require('./routes/vendaRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
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
  initDatabase()
    .then(() => {
      app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
    })
    .catch((error) => {
      console.error('Erro ao inicializar banco:', error.message);
      process.exit(1);
    });
}

module.exports = app;
