// Repete pela API os casos que antes davam 500 ou gravavam dado errado
jest.mock('../repositories/usuarioRepository');
jest.mock('../repositories/clienteRepository');
jest.mock('../repositories/produtoRepository');
jest.mock('../repositories/vendaRepository');

const request = require('supertest');
const app = require('../server');
const usuarioRepository = require('../repositories/usuarioRepository');
const clienteRepository = require('../repositories/clienteRepository');
const produtoRepository = require('../repositories/produtoRepository');
const vendaRepository = require('../repositories/vendaRepository');
const { tokenDe, admin } = require('./helpers');

const auth = { Authorization: `Bearer ${tokenDe(admin)}` };

describe('validação dos dados enviados', () => {
  beforeEach(() => usuarioRepository.findById.mockResolvedValue(admin));
  afterEach(() => jest.clearAllMocks());

  test('ID que não é número devolve 400 e nem consulta o banco', async () => {
    const res = await request(app).get('/clientes/abc').set(auth);
    expect(res.status).toBe(400);
    expect(clienteRepository.findById).not.toHaveBeenCalled();
  });

  test('preço em texto devolve 400 (antes era 500 do MySQL)', async () => {
    const res = await request(app).post('/produtos').set(auth).send({ nome: 'X', preco: 'abc' });
    expect(res.status).toBe(400);
    expect(produtoRepository.create).not.toHaveBeenCalled();
  });

  test('estoque negativo devolve 400 (antes era gravado)', async () => {
    produtoRepository.findById.mockResolvedValue({ id: 2, nome: 'Camisa' });
    const res = await request(app).put('/produtos/2').set(auth).send({ quantidade_estoque: -5 });
    expect(res.status).toBe(400);
    expect(produtoRepository.update).not.toHaveBeenCalled();
  });

  test('CPF com máscara é aceito (antes dava 500 "Data too long")', async () => {
    clienteRepository.findByCpf.mockResolvedValue(undefined);
    clienteRepository.create.mockImplementation(async (c) => ({ id: 7, ...c }));

    const res = await request(app)
      .post('/clientes')
      .set(auth)
      .send({ nome: 'Ana', cpf: '529.982.247-25', email: 'ana@email.com' });

    expect(res.status).toBe(201);
    expect(res.body.cpf).toBe('52998224725');
  });

  test('CPF 00000000000 é recusado', async () => {
    const res = await request(app)
      .post('/clientes')
      .set(auth)
      .send({ nome: 'B', cpf: '00000000000', email: 'b@b.com' });
    expect(res.status).toBe(400);
  });

  test('venda com quantidade 1.5 é recusada (antes gravava total errado)', async () => {
    const res = await request(app)
      .post('/vendas')
      .set(auth)
      .send({ id_cliente: 1, itens: [{ id_produto: 3, quantidade: 1.5 }] });
    expect(res.status).toBe(400);
    expect(vendaRepository.create).not.toHaveBeenCalled();
  });

  test('itens que não são lista devolvem 400', async () => {
    const res = await request(app)
      .post('/vendas')
      .set(auth)
      .send({ id_cliente: 1, itens: 'camisa' });
    expect(res.status).toBe(400);
  });

  test('resumo do período devolve os totais', async () => {
    vendaRepository.resumoPorPeriodo.mockResolvedValue({ total_vendas: 2, faturamento: 349.8 });

    const res = await request(app)
      .get('/relatorios/resumo?inicio=2026-11-01&fim=2026-11-05')
      .set(auth);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      inicio: '2026-11-01',
      fim: '2026-11-05',
      total_vendas: 2,
      faturamento: 349.8,
      ticket_medio: 174.9,
    });
  });
});
