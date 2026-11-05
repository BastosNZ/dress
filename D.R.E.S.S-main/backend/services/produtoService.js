const produtoRepository = require('../repositories/produtoRepository');
const AppError = require('../utils/AppError');

async function listar() {
  return produtoRepository.findAll();
}

async function buscarPorId(id) {
  const produto = await produtoRepository.findById(id);
  if (!produto) throw new AppError(404, 'Produto não encontrado');
  return produto;
}

async function criar(dados) {
  const { nome, preco } = dados;

  if (!nome) {
    throw new AppError(400, 'Nome é obrigatório');
  }
  if (preco === undefined || preco === null || Number(preco) < 0) {
    throw new AppError(400, 'Preço não pode ser negativo');
  }

  return produtoRepository.create(dados);
}

async function atualizar(id, dados) {
  await buscarPorId(id);

  if (dados.preco !== undefined && Number(dados.preco) < 0) {
    throw new AppError(400, 'Preço não pode ser negativo');
  }

  return produtoRepository.update(id, dados);
}

async function remover(id) {
  await buscarPorId(id);
  return produtoRepository.remove(id);
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };