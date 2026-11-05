const vendaRepository = require('../repositories/vendaRepository');
const clienteService = require('./clienteService');
const AppError = require('../utils/AppError');
const { paraNumero, lerId, lerData } = require('../utils/validacao');

const MAX_ITENS_POR_VENDA = 50;

async function listar() {
  return vendaRepository.findAll();
}

async function buscarPorId(id) {
  const venda = await vendaRepository.findById(lerId(id, 'venda'));
  if (!venda) throw new AppError(404, 'Venda não encontrada');
  return venda;
}

// Valida os itens e junta produto repetido numa linha só
// ([{id_produto: 1, quantidade: 2}, {id_produto: 1, quantidade: 1}] vira quantidade 3)
function prepararItens(itens) {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new AppError(400, 'Não é possível registrar venda sem itens');
  }
  if (itens.length > MAX_ITENS_POR_VENDA) {
    throw new AppError(400, `Uma venda pode ter no máximo ${MAX_ITENS_POR_VENDA} itens`);
  }

  const quantidadePorProduto = new Map();

  for (const item of itens) {
    if (!item || typeof item !== 'object') {
      throw new AppError(400, 'Item de venda inválido');
    }

    const idProduto = lerId(item.id_produto, 'produto');
    const quantidade = paraNumero(item.quantidade);

    // Antes 1.5 passava: o item ia pro banco como 2 e o total era calculado com 1.5
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new AppError(400, `Quantidade do produto ${idProduto} deve ser um número inteiro maior que zero`);
    }

    quantidadePorProduto.set(idProduto, (quantidadePorProduto.get(idProduto) || 0) + quantidade);
  }

  return [...quantidadePorProduto].map(([id_produto, quantidade]) => ({ id_produto, quantidade }));
}

async function registrar({ id_usuario, id_cliente, itens }) {
  if (id_cliente === undefined || id_cliente === null || id_cliente === '') {
    throw new AppError(400, 'Cliente é obrigatório');
  }

  const itensValidos = prepararItens(itens);
  await clienteService.buscarPorId(id_cliente);

  // Produto inexistente ou sem estoque o próprio repository já avisa com AppError
  return vendaRepository.create({
    id_usuario,
    id_cliente: lerId(id_cliente, 'cliente'),
    itens: itensValidos,
  });
}

function lerPeriodo(inicio, fim) {
  if (!inicio || !fim) {
    throw new AppError(400, 'Período inicial e final são obrigatórios');
  }
  lerData(inicio, 'Data inicial');
  lerData(fim, 'Data final');
  // formato AAAA-MM-DD dá pra comparar como texto
  if (inicio > fim) {
    throw new AppError(400, 'A data inicial não pode ser depois da data final');
  }
}

async function relatorioPorPeriodo(inicio, fim) {
  lerPeriodo(inicio, fim);
  return vendaRepository.findByPeriodo(inicio, fim);
}

async function resumoPorPeriodo(inicio, fim) {
  lerPeriodo(inicio, fim);
  const { total_vendas, faturamento } = await vendaRepository.resumoPorPeriodo(inicio, fim);

  return {
    inicio,
    fim,
    total_vendas,
    faturamento,
    ticket_medio: total_vendas > 0 ? Math.round((faturamento / total_vendas) * 100) / 100 : 0,
  };
}

async function relatorioPorCliente(idCliente) {
  const cliente = await clienteService.buscarPorId(idCliente);
  return vendaRepository.findByCliente(cliente.id);
}

module.exports = {
  listar,
  buscarPorId,
  registrar,
  relatorioPorPeriodo,
  resumoPorPeriodo,
  relatorioPorCliente,
};
