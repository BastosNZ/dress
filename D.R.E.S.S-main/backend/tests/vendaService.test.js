jest.mock('../repositories/vendaRepository');
jest.mock('../services/clienteService');
const vendaRepository = require('../repositories/vendaRepository');
const clienteService = require('../services/clienteService');
const vendaService = require('../services/vendaService');

describe('vendaService', () => {
  afterEach(() => jest.clearAllMocks());

  test('não permite venda sem itens', async () => {
    await expect(vendaService.registrar({ id_usuario: 1, id_cliente: 1, itens: [] }))
      .rejects.toMatchObject({ status: 400 });
  });

  test('não permite venda sem cliente', async () => {
    await expect(vendaService.registrar({ id_usuario: 1, itens: [{ id_produto: 1, quantidade: 1 }] }))
      .rejects.toMatchObject({ status: 400 });
  });

  test('registra venda válida', async () => {
    clienteService.buscarPorId.mockResolvedValue({ id: 1 });
    vendaRepository.create.mockResolvedValue({ id: 1, valor_total: 100 });
    const venda = await vendaService.registrar({
      id_usuario: 1,
      id_cliente: 1,
      itens: [{ id_produto: 1, quantidade: 2 }],
    });
    expect(venda.id).toBe(1);
  });

  test('propaga erro de estoque insuficiente como 400', async () => {
    clienteService.buscarPorId.mockResolvedValue({ id: 1 });
    vendaRepository.create.mockRejectedValue(new Error('Estoque insuficiente para o produto "Camisa"'));
    await expect(vendaService.registrar({
      id_usuario: 1,
      id_cliente: 1,
      itens: [{ id_produto: 1, quantidade: 99 }],
    })).rejects.toMatchObject({ status: 400 });
  });
});