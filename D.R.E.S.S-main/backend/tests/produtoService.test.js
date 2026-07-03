jest.mock('../repositories/produtoRepository');
const produtoRepository = require('../repositories/produtoRepository');
const produtoService = require('../services/produtoService');

describe('produtoService', () => {
  afterEach(() => jest.clearAllMocks());

  test('não permite preço negativo', async () => {
    await expect(produtoService.criar({ nome: 'Camisa', preco: -10 }))
      .rejects.toMatchObject({ status: 400 });
  });

  test('não permite produto sem nome', async () => {
    await expect(produtoService.criar({ preco: 10 }))
      .rejects.toMatchObject({ status: 400 });
  });

  test('cria produto válido', async () => {
    produtoRepository.create.mockResolvedValue({ id: 1, nome: 'Camisa', preco: 50 });
    const produto = await produtoService.criar({ nome: 'Camisa', preco: 50 });
    expect(produto.id).toBe(1);
  });

  test('lança 404 ao buscar produto inexistente', async () => {
    produtoRepository.findById.mockResolvedValue(undefined);
    await expect(produtoService.buscarPorId(999)).rejects.toMatchObject({ status: 404 });
  });
});