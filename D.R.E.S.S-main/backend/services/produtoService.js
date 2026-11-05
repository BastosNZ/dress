const produtoRepository = require('../repositories/produtoRepository');
const AppError = require('../utils/AppError');
const {
  lerId,
  lerTexto,
  lerPreco,
  lerInteiroNaoNegativo,
} = require('../utils/validacao');

async function listar() {
  return produtoRepository.findAll();
}

async function buscarPorId(id) {
  const produto = await produtoRepository.findById(lerId(id, 'produto'));
  if (!produto) throw new AppError(404, 'Produto não encontrado');
  return produto;
}

async function criar(dados) {
  if (dados.preco === undefined || dados.preco === null || dados.preco === '') {
    throw new AppError(400, 'Preço é obrigatório');
  }

  const produto = {
    nome: lerTexto(dados.nome, 'Nome', { obrigatorio: true, max: 150 }),
    descricao: lerTexto(dados.descricao, 'Descrição', { max: 2000 }),
    preco: lerPreco(dados.preco),
    quantidade_estoque: lerInteiroNaoNegativo(dados.quantidade_estoque ?? 0, 'Quantidade em estoque'),
    estoque_minimo: lerInteiroNaoNegativo(dados.estoque_minimo ?? 0, 'Estoque mínimo'),
  };

  return produtoRepository.create(produto);
}

// No update só valida os campos que vieram no corpo
async function atualizar(id, dados) {
  const atual = await buscarPorId(id);
  const mudancas = {};

  if (dados.nome !== undefined) {
    mudancas.nome = lerTexto(dados.nome, 'Nome', { obrigatorio: true, max: 150 });
  }
  if (dados.descricao !== undefined) {
    mudancas.descricao = lerTexto(dados.descricao, 'Descrição', { max: 2000 });
  }
  if (dados.preco !== undefined) {
    mudancas.preco = lerPreco(dados.preco);
  }
  if (dados.quantidade_estoque !== undefined) {
    mudancas.quantidade_estoque = lerInteiroNaoNegativo(dados.quantidade_estoque, 'Quantidade em estoque');
  }
  if (dados.estoque_minimo !== undefined) {
    mudancas.estoque_minimo = lerInteiroNaoNegativo(dados.estoque_minimo, 'Estoque mínimo');
  }

  return produtoRepository.update(atual.id, mudancas);
}

async function remover(id) {
  const produto = await buscarPorId(id);

  // Se apagar, as vendas antigas perdem o produto. Por enquanto bloqueia;
  // a ideia é trocar por "desativar" quando entrar a coluna ativo.
  const foiVendido = await produtoRepository.hasVendas(produto.id);
  if (foiVendido) {
    throw new AppError(409, 'Produto já foi vendido e não pode ser excluído');
  }

  return produtoRepository.remove(produto.id);
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
