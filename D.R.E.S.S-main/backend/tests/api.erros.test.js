// Testes de integração: sobem o app do Express de verdade com o supertest,
// mas com os repositories mockados, então não precisa de banco.
jest.mock('../repositories/clienteRepository');
jest.mock('../repositories/produtoRepository');
jest.mock('../repositories/vendaRepository');

const request = require('supertest');
const app = require('../server');
const clienteRepository = require('../repositories/clienteRepository');
const produtoRepository = require('../repositories/produtoRepository');
const vendaRepository = require('../repositories/vendaRepository');
const AppError = require('../utils/AppError');
const { tokenDe, admin } = require('./helpers');

const auth = { Authorization: `Bearer ${tokenDe(admin)}` };

describe('tratamento de erros da API', () => {
  let consoleError;

  beforeEach(() => {
    // o errorHandler loga erros inesperados, aqui não precisa poluir a saída
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleError.mockRestore();
  });

  test('JSON mal formatado devolve 400 em JSON, não página HTML', async () => {
    const res = await request(app)
      .post('/clientes')
      .set(auth)
      .set('Content-Type', 'application/json')
      .send('{nome:');

    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.erro).toBe('JSON inválido no corpo da requisição');
  });

  test('rota que não existe devolve 404', async () => {
    const res = await request(app).get('/nao-existe');
    expect(res.status).toBe(404);
    expect(res.body.erro).toBe('Rota não encontrada');
  });

  test('erro inesperado vira 500 sem mostrar a mensagem interna', async () => {
    clienteRepository.findAll.mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1:3306'));

    const res = await request(app).get('/clientes').set(auth);

    expect(res.status).toBe(500);
    expect(res.body.erro).toBe('Erro interno do servidor');
    expect(JSON.stringify(res.body)).not.toMatch(/ECONNREFUSED/);
  });

  test('chave duplicada no MySQL vira 409', async () => {
    produtoRepository.create.mockRejectedValue(Object.assign(new Error('Duplicate entry'), { code: 'ER_DUP_ENTRY' }));

    const res = await request(app).post('/produtos').set(auth).send({ nome: 'Camisa', preco: 50 });

    expect(res.status).toBe(409);
    expect(res.body.erro).toBe('Registro duplicado');
  });

  test('apagar registro em uso vira 409 e não mostra o erro cru do banco', async () => {
    produtoRepository.findById.mockResolvedValue({ id: 1, nome: 'Vestido' });
    produtoRepository.remove.mockRejectedValue(Object.assign(
      new Error('Cannot delete or update a parent row: a foreign key constraint fails'),
      { code: 'ER_ROW_IS_REFERENCED_2' }
    ));

    const res = await request(app).delete('/produtos/1').set(auth);

    expect(res.status).toBe(409);
    expect(res.body.erro).not.toMatch(/foreign key/);
  });

  test('estoque insuficiente chega como 400 com a mensagem certa', async () => {
    clienteRepository.findById.mockResolvedValue({ id: 1 });
    vendaRepository.create.mockRejectedValue(new AppError(400, 'Estoque insuficiente para o produto "Jaqueta"'));

    const res = await request(app)
      .post('/vendas')
      .set(auth)
      .send({ id_cliente: 1, itens: [{ id_produto: 4, quantidade: 50 }] });

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('Estoque insuficiente para o produto "Jaqueta"');
  });
});
