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
      clienteService.criar({ nome: 'Ana', cpf: '52998224725', email: 'invalido' })
    ).rejects.toMatchObject({ status: 400 });
  });

  test('não permite CPF duplicado', async () => {
    clienteRepository.findByCpf.mockResolvedValue({ id: 1, cpf: '52998224725' });
    await expect(
      clienteService.criar({ nome: 'Ana', cpf: '52998224725', email: 'ana@email.com' })
    ).rejects.toMatchObject({ status: 409 });
  });

  test('cria cliente válido', async () => {
    clienteRepository.findByCpf.mockResolvedValue(undefined);
    clienteRepository.create.mockResolvedValue({ id: 1, nome: 'Ana', cpf: '52998224725', email: 'ana@email.com' });
    const cliente = await clienteService.criar({ nome: 'Ana', cpf: '52998224725', email: 'ana@email.com' });
    expect(cliente.id).toBe(1);
  });

  test('aceita CPF com máscara e salva só os números', async () => {
    clienteRepository.findByCpf.mockResolvedValue(undefined);
    clienteRepository.create.mockImplementation(async (c) => ({ id: 2, ...c }));
    const cliente = await clienteService.criar({ nome: 'Ana', cpf: '529.982.247-25', email: 'Ana@Email.com' });
    expect(cliente.cpf).toBe('52998224725');
    expect(cliente.email).toBe('ana@email.com');
  });

  test('recusa CPF com dígito verificador errado ou todos iguais', async () => {
    await expect(clienteService.criar({ nome: 'Ana', cpf: '52998224726', email: 'ana@email.com' }))
      .rejects.toMatchObject({ status: 400, message: 'CPF inválido' });
    await expect(clienteService.criar({ nome: 'Ana', cpf: '00000000000', email: 'ana@email.com' }))
      .rejects.toMatchObject({ status: 400, message: 'CPF inválido' });
  });

  test('não deixa apagar o nome na edição', async () => {
    clienteRepository.findById.mockResolvedValue({ id: 1, nome: 'Ana', cpf: '52998224725' });
    await expect(clienteService.atualizar(1, { nome: '   ' }))
      .rejects.toMatchObject({ status: 400 });
  });

  test('edita cliente antigo sem mexer no CPF mesmo que ele esteja fora do padrão', async () => {
    clienteRepository.findById.mockResolvedValue({ id: 1, nome: 'Mariana', cpf: '12345678901' });
    clienteRepository.update.mockResolvedValue({ id: 1, nome: 'Mariana Souza', cpf: '12345678901' });
    await clienteService.atualizar(1, { nome: 'Mariana Souza', cpf: '12345678901' });
    expect(clienteRepository.update).toHaveBeenCalledWith(1, { nome: 'Mariana Souza' });
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