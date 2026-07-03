class Venda {
  constructor({ id, id_usuario, id_cliente, data, valor_total, itens }) {
    this.id = id;
    this.id_usuario = id_usuario;
    this.id_cliente = id_cliente;
    this.data = data;
    this.valor_total = valor_total;
    this.itens = itens || [];
  }
}

module.exports = Venda;