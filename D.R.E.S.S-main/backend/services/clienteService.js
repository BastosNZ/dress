const clienteRepository = require('../repositories/clienteRepository');
const AppError = require('../utils/AppError');

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCpf(cpf) {
  return /^\d{11}$/.test(String(cpf).replace(/\D/g, ''));
}

async function listar() {
  return clienteRepository.findAll();
}

async function buscarPorId(id) {
  const cliente = await clienteRepository.findById(id);
  if (!cliente) throw new AppError(404, 'Cliente não encontrado');
  return cliente;
}

async function criar(dados) {
  const { nome, cpf, email } = dados;

  if (!nome || !cpf || !email) {
    throw new AppError(400, 'Nome, CPF e email são obrigatórios');
  }
  if (!validarCpf(cpf)) {
    throw new AppError(400, 'CPF inválido');
  }
  if (!validarEmail(email)) {
    throw new AppError(400, 'Email inválido');
  }

  const existente = await clienteRepository.findByCpf(cpf);
  if (existente) {
    throw new AppError(409, 'CPF já cadastrado');
  }

  return clienteRepository.create(dados);
}

async function atualizar(id, dados) {
  await buscarPorId(id);

  if (dados.email && !validarEmail(dados.email)) {
    throw new AppError(400, 'Email inválido');
  }

  if (dados.cpf) {
    if (!validarCpf(dados.cpf)) {
      throw new AppError(400, 'CPF inválido');
    }
    const existente = await clienteRepository.findByCpf(dados.cpf);
    if (existente && Number(existente.id) !== Number(id)) {
      throw new AppError(409, 'CPF já cadastrado');
    }
  }

  return clienteRepository.update(id, dados);
}

async function remover(id) {
  await buscarPorId(id);
  const possuiVendas = await clienteRepository.hasVendas(id);
  if (possuiVendas) {
    throw new AppError(409, 'Cliente possui vendas registradas e não pode ser removido');
  }
  return clienteRepository.remove(id);
}

module.exports = { listar, buscarPorId, criar, atualizar, remover, validarCpf, validarEmail };