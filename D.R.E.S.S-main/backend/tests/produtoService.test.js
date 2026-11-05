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

  test('não permite preço que não é número', async () => {
    await expect(produtoService.criar({ nome: 'Camisa', preco: 'abc' }))
      .rejects.toMatchObject({ status: 400, message: 'Preço deve ser um número' });
  });

  test('não permite estoque negativo nem quebrado na edição', async () => {
    produtoRepository.findById.mockResolvedValue({ id: 2, nome: 'Camisa' });
    await expect(produtoService.atualizar(2, { quantidade_estoque: -5 }))
      .rejects.toMatchObject({ status: 400 });
    await expect(produtoService.atualizar(2, { quantidade_estoque: 2.5 }))
      .rejects.toMatchObject({ status: 400 });
    expect(produtoRepository.update).not.toHaveBeenCalled();
  });

  test('não exclui produto que já foi vendido', async () => {
    produtoRepository.findById.mockResolvedValue({ id: 1, nome: 'Vestido' });
    produtoRepository.hasVendas.mockResolvedValue(true);
    await expect(produtoService.remover(1)).rejects.toMatchObject({ status: 409 });
    expect(produtoRepository.remove).not.toHaveBeenCalled();
  });

  test('lança 404 ao buscar produto inexistente', async () => {
    produtoRepository.findById.mockResolvedValue(undefined);
    await expect(produtoService.buscarPorId(999)).rejects.toMatchObject({ status: 404 });
  });
});