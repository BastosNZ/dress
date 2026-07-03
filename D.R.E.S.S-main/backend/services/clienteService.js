const clienteRepository = require('../repositories/clienteRepository');

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
  if (!cliente) throw { status: 404, message: 'Cliente não encontrado' };
  return cliente;
}

async function criar(dados) {
  const { nome, cpf, email } = dados;

  if (!nome || !cpf || !email) {
    throw { status: 400, message: 'Nome, CPF e email são obrigatórios' };
  }
  if (!validarCpf(cpf)) {
    throw { status: 400, message: 'CPF inválido' };
  }
  if (!validarEmail(email)) {
    throw { status: 400, message: 'Email inválido' };
  }

  const existente = await clienteRepository.findByCpf(cpf);
  if (existente) {
    throw { status: 409, message: 'CPF já cadastrado' };
  }

  return clienteRepository.create(dados);
}

async function atualizar(id, dados) {
  await buscarPorId(id);

  if (dados.email && !validarEmail(dados.email)) {
    throw { status: 400, message: 'Email inválido' };
  }

  if (dados.cpf) {
    if (!validarCpf(dados.cpf)) {
      throw { status: 400, message: 'CPF inválido' };
    }
    const existente = await clienteRepository.findByCpf(dados.cpf);
    if (existente && Number(existente.id) !== Number(id)) {
      throw { status: 409, message: 'CPF já cadastrado' };
    }
  }

  return clienteRepository.update(id, dados);
}

async function remover(id) {
  await buscarPorId(id);
  const possuiVendas = await clienteRepository.hasVendas(id);
  if (possuiVendas) {
    throw { status: 409, message: 'Cliente possui vendas registradas e não pode ser removido' };
  }
  return clienteRepository.remove(id);
}

module.exports = { listar, buscarPorId, criar, atualizar, remover, validarCpf, validarEmail };