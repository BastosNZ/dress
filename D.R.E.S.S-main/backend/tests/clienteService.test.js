jest.mock('../repositories/clienteRepository');
const clienteRepository = require('../repositories/clienteRepository');
const clienteService = require('../services/clienteService');

describe('clienteService', () => {
  afterEach(() => jest.clearAllMocks());

  test('não permite criar cliente com CPF inválido', async () => {
    await expect(
      clienteService.criar({ nome: 'Ana', cpf: '123', email: 'ana@email.com' })
    ).rejects.toMatchObject({ status: 400 });
  });

  test('não permite criar cliente com email inválido', async () => {
    await expect(
      clienteService.criar({ nome: 'Ana', cpf: '12345678901', email: 'invalido' })
    ).rejects.toMatchObject({ status: 400 });
  });

  test('não permite CPF duplicado', async () => {
    clienteRepository.findByCpf.mockResolvedValue({ id: 1, cpf: '12345678901' });
    await expect(
      clienteService.criar({ nome: 'Ana', cpf: '12345678901', email: 'ana@email.com' })
    ).rejects.toMatchObject({ status: 409 });
  });

  test('cria cliente válido', async () => {
    clienteRepository.findByCpf.mockResolvedValue(undefined);
    clienteRepository.create.mockResolvedValue({ id: 1, nome: 'Ana', cpf: '12345678901', email: 'ana@email.com' });
    const cliente = await clienteService.criar({ nome: 'Ana', cpf: '12345678901', email: 'ana@email.com' });
    expect(cliente.id).toBe(1);
  });

  test('não remove cliente com vendas registradas', async () => {
    clienteRepository.findById.mockResolvedValue({ id: 1 });
    clienteRepository.hasVendas.mockResolvedValue(true);
    await expect(clienteService.remover(1)).rejects.toMatchObject({ status: 409 });
  });

  test('remove cliente sem vendas', async () => {
    clienteRepository.findById.mockResolvedValue({ id: 1 });
    clienteRepository.hasVendas.mockResolvedValue(false);
    clienteRepository.remove.mockResolvedValue();
    await expect(clienteService.remover(1)).resolves.toBeUndefined();
  });
});