const clienteRepository = require('../repositories/clienteRepository');
const AppError = require('../utils/AppError');
const {
  lerId,
  lerTexto,
  limparCpf,
  cpfValido,
  emailValido,
} = require('../utils/validacao');

function lerCpf(valor) {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    throw new AppError(400, 'CPF é obrigatório');
  }
  if (!cpfValido(valor)) {
    throw new AppError(400, 'CPF inválido');
  }
  // Salva sempre só os 11 números (a coluna é VARCHAR(11))
  return limparCpf(valor);
}

function lerEmail(valor) {
  const email = lerTexto(valor, 'Email', { obrigatorio: true, max: 150 });
  if (!emailValido(email)) {
    throw new AppError(400, 'Email inválido');
  }
  return email.toLowerCase();
}

async function listar() {
  return clienteRepository.findAll();
}

async function buscarPorId(id) {
  const cliente = await clienteRepository.findById(lerId(id, 'cliente'));
  if (!cliente) throw new AppError(404, 'Cliente não encontrado');
  return cliente;
}

async function criar(dados) {
  const cliente = {
    nome: lerTexto(dados.nome, 'Nome', { obrigatorio: true, max: 150 }),
    cpf: lerCpf(dados.cpf),
    email: lerEmail(dados.email),
    telefone: lerTexto(dados.telefone, 'Telefone', { max: 20 }),
    endereco: lerTexto(dados.endereco, 'Endereço', { max: 255 }),
  };

  const existente = await clienteRepository.findByCpf(cliente.cpf);
  if (existente) {
    throw new AppError(409, 'CPF já cadastrado');
  }

  return clienteRepository.create(cliente);
}

async function atualizar(id, dados) {
  const atual = await buscarPorId(id);
  const mudancas = {};

  if (dados.nome !== undefined) {
    mudancas.nome = lerTexto(dados.nome, 'Nome', { obrigatorio: true, max: 150 });
  }
  if (dados.email !== undefined) {
    mudancas.email = lerEmail(dados.email);
  }
  if (dados.telefone !== undefined) {
    mudancas.telefone = lerTexto(dados.telefone, 'Telefone', { max: 20 });
  }
  if (dados.endereco !== undefined) {
    mudancas.endereco = lerTexto(dados.endereco, 'Endereço', { max: 255 });
  }

  // O frontend sempre manda o CPF no formulário de edição. Só valida se ele
  // realmente mudou, senão cliente antigo com CPF fora do padrão não consegue
  // mais ser editado.
  if (dados.cpf !== undefined && limparCpf(dados.cpf) !== atual.cpf) {
    mudancas.cpf = lerCpf(dados.cpf);
    const existente = await clienteRepository.findByCpf(mudancas.cpf);
    if (existente && Number(existente.id) !== Number(atual.id)) {
      throw new AppError(409, 'CPF já cadastrado');
    }
  }

  return clienteRepository.update(atual.id, mudancas);
}

async function remover(id) {
  const cliente = await buscarPorId(id);
  const possuiVendas = await clienteRepository.hasVendas(cliente.id);
  if (possuiVendas) {
    throw new AppError(409, 'Cliente possui vendas registradas e não pode ser removido');
  }
  return clienteRepository.remove(cliente.id);
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
