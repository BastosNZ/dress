INSERT IGNORE INTO clientes (nome, cpf, email, telefone, endereco) VALUES
('Mariana Souza', '12345678901', 'mariana@email.com', '(11) 99999-1111', 'Rua das Flores, 120'),
('Carlos Lima', '98765432100', 'carlos@email.com', '(21) 98888-2222', 'Av. Central, 450'),
('Fernanda Alves', '45678912300', 'fernanda@email.com', '(31) 97777-3333', 'Rua Minas Gerais, 88'),
('Rafael Martins', '32165498700', 'rafael@email.com', '(41) 96666-4444', 'Rua Paraná, 210'),
('Beatriz Rocha', '74185296300', 'beatriz@email.com', '(51) 95555-5555', 'Av. Brasil, 900');

INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, estoque_minimo)
SELECT 'Vestido Elegance', 'Vestido social feminino para eventos', 189.90, 12, 3
WHERE NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Vestido Elegance');

INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, estoque_minimo)
SELECT 'Camisa Classic', 'Camisa masculina manga longa', 129.90, 20, 5
WHERE NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Camisa Classic');

INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, estoque_minimo)
SELECT 'Calça Urban', 'Calça jeans slim confortável', 159.90, 8, 4
WHERE NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Calça Urban');

INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, estoque_minimo)
SELECT 'Jaqueta Premium', 'Jaqueta casual de inverno', 249.90, 4, 2
WHERE NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Jaqueta Premium');

INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, estoque_minimo)
SELECT 'Blusa Soft', 'Blusa básica de algodão', 79.90, 25, 6
WHERE NOT EXISTS (SELECT 1 FROM produtos WHERE nome = 'Blusa Soft');