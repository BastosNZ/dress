const initDatabase = require('./config/initDatabase');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const vendaRoutes = require('./routes/vendaRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');

const app = express();
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