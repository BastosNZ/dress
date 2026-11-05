jest.mock('../repositories/vendaRepository');
jest.mock('../services/clienteService');
const vendaRepository = require('../repositories/vendaRepository');
const clienteService = require('../services/clienteService');
const vendaService = require('../services/vendaService');
const AppError = require('../utils/AppError');

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

  test('não aceita quantidade quebrada (1.5)', async () => {
    await expect(vendaService.registrar({
      id_usuario: 1,
      id_cliente: 1,
      itens: [{ id_produto: 3, quantidade: 1.5 }],
    })).rejects.toMatchObject({ status: 400 });
    expect(vendaRepository.create).not.toHaveBeenCalled();
  });

  test('junta o mesmo produto repetido no carrinho', async () => {
    clienteService.buscarPorId.mockResolvedValue({ id: 1 });
    vendaRepository.create.mockResolvedValue({ id: 1 });
    await vendaService.registrar({
      id_usuario: 1,
      id_cliente: 1,
      itens: [
        { id_produto: 1, quantidade: 2 },
        { id_produto: 2, quantidade: 1 },
        { id_produto: 1, quantidade: 1 },
      ],
    });
    expect(vendaRepository.create.mock.calls[0][0].itens).toEqual([
      { id_produto: 1, quantidade: 3 },
      { id_produto: 2, quantidade: 1 },
    ]);
  });

  test('relatório recusa data inválida ou período invertido', async () => {
    await expect(vendaService.relatorioPorPeriodo('2026-02-31', '2026-03-01'))
      .rejects.toMatchObject({ status: 400 });
    await expect(vendaService.relatorioPorPeriodo('05/11/2026', '2026-11-05'))
      .rejects.toMatchObject({ status: 400 });
    await expect(vendaService.relatorioPorPeriodo('2026-11-10', '2026-11-01'))
      .rejects.toMatchObject({ status: 400 });
  });

  test('resumo calcula o ticket médio e não divide por zero', async () => {
    vendaRepository.resumoPorPeriodo.mockResolvedValue({ total_vendas: 3, faturamento: 500 });
    const resumo = await vendaService.resumoPorPeriodo('2026-11-01', '2026-11-05');
    expect(resumo.ticket_medio).toBe(166.67);

    vendaRepository.resumoPorPeriodo.mockResolvedValue({ total_vendas: 0, faturamento: 0 });
    const vazio = await vendaService.resumoPorPeriodo('2026-11-01', '2026-11-05');
    expect(vazio.ticket_medio).toBe(0);
  });

  test('propaga erro de estoque insuficiente como 400', async () => {
    clienteService.buscarPorId.mockResolvedValue({ id: 1 });
    vendaRepository.create.mockRejectedValue(new AppError(400, 'Estoque insuficiente para o produto "Camisa"'));
    await expect(vendaService.registrar({
      id_usuario: 1,
      id_cliente: 1,
      itens: [{ id_produto: 1, quantidade: 99 }],
    })).rejects.toMatchObject({ status: 400 });
  });
});