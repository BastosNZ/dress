jest.mock('../config/database');

const request = require('supertest');
const app = require('../server');
const db = require('../config/database');

describe('GET /health', () => {
  const versaoOriginal = process.env.APP_VERSION;
  afterEach(() => {
    jest.clearAllMocks();
    process.env.APP_VERSION = versaoOriginal;
  });

  test('responde ok com a versão quando o banco está de pé', async () => {
    process.env.APP_VERSION = '1.1.0';
    db.query.mockResolvedValue([[{ 1: 1 }]]);

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', versao: '1.1.0', banco: 'ok' });
  });

  test('responde 503 quando o banco caiu', async () => {
    db.query.mockRejectedValue(new Error('connect ECONNREFUSED'));

    const res = await request(app).get('/health');

    expect(res.status).toBe(503);
    expect(res.body.banco).toBe('indisponivel');
  });

  test('não precisa de token', async () => {
    db.query.mockResolvedValue([[{ 1: 1 }]]);
    const res = await request(app).get('/health');
    expect(res.status).not.toBe(401);
  });
});
