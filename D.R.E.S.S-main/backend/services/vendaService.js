const vendaRepository = require('../repositories/vendaRepository');
const clienteService = require('./clienteService');

async function listar() {
  return vendaRepository.findAll();
}

async function buscarPorId(id) {
  const venda = await vendaRepository.findById(id);
  if (!venda) throw { status: 404, message: 'Venda não encontrada' };
  return venda;
}

async function registrar({ id_usuario, id_cliente, itens }) {
  if (!itens || itens.length === 0) {
    throw { status: 400, message: 'Não é possível registrar venda sem itens' };
  }
  if (!id_cliente) {
    throw { status: 400, message: 'Cliente é obrigatório' };
  }

  await clienteService.buscarPorId(id_cliente);

  for (const item of itens) {
    if (!item.id_produto || !item.quantidade || item.quantidade <= 0) {
      throw { status: 400, message: 'Item de venda inválido' };
    }
  }

  try {
    return await vendaRepository.create({ id_usuario, id_cliente, itens });
  } catch (err) {
    if (err.status) throw err;
    throw { status: 400, message: err.message };
  }
}

async function relatorioPorPeriodo(inicio, fim) {
  if (!inicio || !fim) {
    throw { status: 400, message: 'Período inicial e final são obrigatórios' };
  }
  return vendaRepository.findByPeriodo(inicio, fim);
}

async function relatorioPorCliente(idCliente) {
  await clienteService.buscarPorId(idCliente);
  return vendaRepository.findByCliente(idCliente);
}

module.exports = { listar, buscarPorId, registrar, relatorioPorPeriodo, relatorioPorCliente };