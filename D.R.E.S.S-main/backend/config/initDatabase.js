const bcrypt = require('bcryptjs');
const db = require('./database');

async function createTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      senha VARCHAR(255) NOT NULL,
      perfil ENUM('ADMIN', 'FUNCIONARIO') NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(150) NOT NULL,
      cpf VARCHAR(11) NOT NULL UNIQUE,
      email VARCHAR(150) NOT NULL,
      telefone VARCHAR(20),
      endereco VARCHAR(255)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(150) NOT NULL,
      descricao TEXT,
      preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
      quantidade_estoque INT NOT NULL DEFAULT 0,
      estoque_minimo INT NOT NULL DEFAULT 0
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS vendas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_usuario INT NOT NULL,
      id_cliente INT NOT NULL,
      data DATETIME DEFAULT CURRENT_TIMESTAMP,
      valor_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
      FOREIGN KEY (id_cliente) REFERENCES clientes(id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS itens_venda (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_venda INT NOT NULL,
      id_produto INT NOT NULL,
      quantidade INT NOT NULL,
      preco_unitario DECIMAL(10,2) NOT NULL,
      subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
      FOREIGN KEY (id_venda) REFERENCES vendas(id) ON DELETE CASCADE,
      FOREIGN KEY (id_produto) REFERENCES produtos(id)
    )
  `);
}

async function ensureAdminUser() {
  const [usuarios] = await db.query(
    'SELECT id FROM usuarios WHERE username = ? LIMIT 1',
    ['admin']
  );

  if (usuarios.length === 0) {
    const senhaHash = await bcrypt.hash('123456', 10);

    await db.query(
      'INSERT INTO usuarios (username, senha, perfil, is_active) VALUES (?, ?, ?, ?)',
      ['admin', senhaHash, 'ADMIN', true]
    );

    console.log('Usuário admin criado.');
  }
}

async function seedClientes() {
  const [clientes] = await db.query('SELECT COUNT(*) AS total FROM clientes');

  if (clientes[0].total === 0) {
    await db.query(`
      INSERT INTO clientes (nome, cpf, email, telefone, endereco) VALUES
      ('Mariana Souza', '12345678901', 'mariana@email.com', '(11) 99999-1111', 'Rua das Flores, 120'),
      ('Carlos Lima', '98765432100', 'carlos@email.com', '(21) 98888-2222', 'Av. Central, 450'),
      ('Fernanda Alves', '45678912300', 'fernanda@email.com', '(31) 97777-3333', 'Rua Minas Gerais, 88'),
      ('Rafael Martins', '32165498700', 'rafael@email.com', '(41) 96666-4444', 'Rua Paraná, 210'),
      ('Beatriz Rocha', '74185296300', 'beatriz@email.com', '(51) 95555-5555', 'Av. Brasil, 900')
    `);

    console.log('Clientes iniciais inseridos.');
  }
}

async function seedProdutos() {
  const [produtos] = await db.query('SELECT COUNT(*) AS total FROM produtos');

  if (produtos[0].total === 0) {
    await db.query(`
      INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, estoque_minimo) VALUES
      ('Vestido Elegance', 'Vestido social feminino para eventos', 189.90, 12, 3),
      ('Camisa Classic', 'Camisa masculina manga longa', 129.90, 20, 5),
      ('Calça Urban', 'Calça jeans slim confortável', 159.90, 8, 4),
      ('Jaqueta Premium', 'Jaqueta casual de inverno', 249.90, 4, 2),
      ('Blusa Soft', 'Blusa básica de algodão', 79.90, 25, 6)
    `);

    console.log('Produtos iniciais inseridos.');
  }
}

async function initDatabase() {
  await createTables();
  await ensureAdminUser();
  await seedClientes();
  await seedProdutos();

  console.log('Banco verificado e dados iniciais carregados.');
}

module.exports = initDatabase;