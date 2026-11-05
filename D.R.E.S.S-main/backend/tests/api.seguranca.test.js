jest.mock('../repositories/usuarioRepository');
jest.mock('../repositories/clienteRepository');

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../server');
const usuarioRepository = require('../repositories/usuarioRepository');
const clienteRepository = require('../repositories/clienteRepository');
const { tokenDe, admin, funcionario } = require('./helpers');

const comoAdmin = { Authorization: `Bearer ${tokenDe(admin)}` };
const comoFuncionario = { Authorization: `Bearer ${tokenDe(funcionario)}` };

// Simula o banco: o middleware busca o usuário pelo id do token
function usuariosNoBanco(...usuarios) {
  usuarioRepository.findById.mockImplementation(async (id) =>
    usuarios.find((u) => u.id === Number(id))
  );
}

describe('segurança e permissões', () => {
  beforeEach(() => usuariosNoBanco(admin, funcionario));
  afterEach(() => jest.clearAllMocks());

  describe('cadastro de usuários', () => {
    test('a rota pública antiga /auth/registrar não existe mais', async () => {
      const res = await request(app)
        .post('/auth/registrar')
        .send({ username: 'hacker', senha: '123456', perfil: 'ADMIN' });

      expect(res.status).toBe(404);
      expect(usuarioRepository.create).not.toHaveBeenCalled();
    });

    test('sem token não cria usuário', async () => {
      const res = await request(app)
        .post('/usuarios')
        .send({ username: 'hacker', senha: '123456', perfil: 'ADMIN' });

      expect(res.status).toBe(401);
      expect(usuarioRepository.create).not.toHaveBeenCalled();
    });

    test('FUNCIONARIO não cria usuário', async () => {
      const res = await request(app)
        .post('/usuarios')
        .set(comoFuncionario)
        .send({ username: 'outro', senha: '123456', perfil: 'ADMIN' });

      expect(res.status).toBe(403);
      expect(usuarioRepository.create).not.toHaveBeenCalled();
    });

    test('ADMIN cria usuário e a senha é salva com hash', async () => {
      usuarioRepository.findByUsername.mockResolvedValue(undefined);
      usuarioRepository.create.mockImplementation(async (u) => ({ id: 3, username: u.username, perfil: u.perfil }));

      const res = await request(app)
        .post('/usuarios')
        .set(comoAdmin)
        .send({ username: 'joao.caixa', senha: 'senha123', perfil: 'FUNCIONARIO' });

      expect(res.status).toBe(201);
      expect(res.body).not.toHaveProperty('senha');
      const senhaSalva = usuarioRepository.create.mock.calls[0][0].senha;
      expect(senhaSalva).not.toBe('senha123');
      expect(await bcrypt.compare('senha123', senhaSalva)).toBe(true);
    });

    test('senha curta é recusada', async () => {
      const res = await request(app)
        .post('/usuarios')
        .set(comoAdmin)
        .send({ username: 'joao', senha: '123', perfil: 'FUNCIONARIO' });

      expect(res.status).toBe(400);
    });
  });

  describe('desativar usuário', () => {
    test('token de usuário desativado para de funcionar na hora', async () => {
      usuariosNoBanco(admin, { ...funcionario, is_active: 0 });

      const res = await request(app).get('/clientes').set(comoFuncionario);

      expect(res.status).toBe(401);
    });

    test('ADMIN não consegue desativar a si mesmo', async () => {
      const res = await request(app)
        .patch(`/usuarios/${admin.id}/ativo`)
        .set(comoAdmin)
        .send({ ativo: false });

      expect(res.status).toBe(400);
      expect(usuarioRepository.setAtivo).not.toHaveBeenCalled();
    });

    test('não deixa desativar o último ADMIN ativo', async () => {
      const outroAdmin = { id: 5, username: 'chefe', perfil: 'ADMIN', is_active: 1 };
      usuariosNoBanco(admin, outroAdmin);
      usuarioRepository.countAdminsAtivos.mockResolvedValue(1);

      const res = await request(app)
        .patch('/usuarios/5/ativo')
        .set(comoAdmin)
        .send({ ativo: false });

      expect(res.status).toBe(409);
    });

    test('ADMIN desativa um funcionário', async () => {
      usuarioRepository.setAtivo.mockResolvedValue({ ...funcionario, is_active: 0 });

      const res = await request(app)
        .patch(`/usuarios/${funcionario.id}/ativo`)
        .set(comoAdmin)
        .send({ ativo: false });

      expect(res.status).toBe(200);
      expect(usuarioRepository.setAtivo).toHaveBeenCalledWith(funcionario.id, false);
    });
  });

  test('ID de usuário inválido (1x) é recusado antes de ir pro banco', async () => {
    const res = await request(app)
      .patch('/usuarios/1x/ativo')
      .set(comoAdmin)
      .send({ ativo: false });

    expect(res.status).toBe(400);
    expect(usuarioRepository.setAtivo).not.toHaveBeenCalled();
  });

  test('login com senha que não é texto devolve 400, não 500', async () => {
    const numero = await request(app).post('/auth/login').send({ username: 'admin', senha: 123456 });
    const lista = await request(app).post('/auth/login').send({ username: ['admin', 'x'], senha: 'a' });

    expect(numero.status).toBe(400);
    expect(lista.status).toBe(400);
    expect(usuarioRepository.findByUsername).not.toHaveBeenCalled();
  });

  describe('permissões por perfil', () => {
    test('FUNCIONARIO não exclui cliente', async () => {
      const res = await request(app).delete('/clientes/5').set(comoFuncionario);

      expect(res.status).toBe(403);
      expect(clienteRepository.remove).not.toHaveBeenCalled();
    });

    test('ADMIN exclui cliente sem vendas', async () => {
      clienteRepository.findById.mockResolvedValue({ id: 5 });
      clienteRepository.hasVendas.mockResolvedValue(false);

      const res = await request(app).delete('/clientes/5').set(comoAdmin);

      expect(res.status).toBe(200);
    });

    test('FUNCIONARIO não acessa a lista de usuários', async () => {
      const res = await request(app).get('/usuarios').set(comoFuncionario);
      expect(res.status).toBe(403);
    });

    test('token assinado com outro segredo é recusado', async () => {
      const jwt = require('jsonwebtoken');
      const falso = jwt.sign({ id: 1, username: 'admin', perfil: 'ADMIN' }, 'segredo_dev');

      const res = await request(app).get('/clientes').set({ Authorization: `Bearer ${falso}` });

      expect(res.status).toBe(401);
    });
  });

  describe('conta do usuário logado', () => {
    test('GET /auth/me devolve quem está logado', async () => {
      const res = await request(app).get('/auth/me').set(comoFuncionario);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 2, username: 'maria', perfil: 'FUNCIONARIO' });
    });

    test('troca de senha exige a senha atual certa', async () => {
      usuarioRepository.findSenhaById.mockResolvedValue(await bcrypt.hash('senhaAntiga', 4));

      const errada = await request(app)
        .put('/auth/senha')
        .set(comoFuncionario)
        .send({ senha_atual: 'chute', nova_senha: 'senhaNova123' });
      expect(errada.status).toBe(401);
      expect(usuarioRepository.updateSenha).not.toHaveBeenCalled();

      const certa = await request(app)
        .put('/auth/senha')
        .set(comoFuncionario)
        .send({ senha_atual: 'senhaAntiga', nova_senha: 'senhaNova123' });
      expect(certa.status).toBe(200);
      expect(usuarioRepository.updateSenha).toHaveBeenCalledTimes(1);
    });
  });
});
