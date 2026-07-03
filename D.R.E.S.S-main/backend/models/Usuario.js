class Usuario {
  constructor({ id, username, senha, perfil, is_active }) {
    this.id = id;
    this.username = username;
    this.senha = senha;
    this.perfil = perfil;
    this.is_active = is_active;
  }
}

module.exports = Usuario;