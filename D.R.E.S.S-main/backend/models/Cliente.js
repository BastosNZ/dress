class Cliente {
  constructor({ id, nome, cpf, email, telefone, endereco }) {
    this.id = id;
    this.nome = nome;
    this.cpf = cpf;
    this.email = email;
    this.telefone = telefone;
    this.endereco = endereco;
  }
}

module.exports = Cliente;