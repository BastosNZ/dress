class Produto {
  constructor({ id, nome, descricao, preco, quantidade_estoque, estoque_minimo }) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco;
    this.quantidade_estoque = quantidade_estoque;
    this.estoque_minimo = estoque_minimo;
  }
}

module.exports = Produto;