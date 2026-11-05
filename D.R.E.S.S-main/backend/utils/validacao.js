const AppError = require('./AppError');

// Funções pequenas de validação usadas pelos services.
// Cada uma devolve o valor já limpo ou lança AppError(400).

// Converte pra número sem as pegadinhas do Number():
// Number('') e Number(' ') dão 0, Number(true) dá 1...
function paraNumero(valor) {
  if (typeof valor === 'number') return valor;
  if (typeof valor === 'string' && valor.trim() !== '') return Number(valor);
  return NaN;
}

function lerId(valor, nome) {
  const id = paraNumero(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, `ID de ${nome} inválido`);
  }
  return id;
}

function lerTexto(valor, campo, { obrigatorio = false, max = 255 } = {}) {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    if (obrigatorio) throw new AppError(400, `${campo} é obrigatório`);
    return null;
  }
  if (typeof valor !== 'string') {
    throw new AppError(400, `${campo} deve ser um texto`);
  }

  const texto = valor.trim();
  if (texto.length > max) {
    throw new AppError(400, `${campo} pode ter no máximo ${max} caracteres`);
  }
  return texto;
}

function lerPreco(valor) {
  const numero = paraNumero(valor);
  if (!Number.isFinite(numero)) {
    throw new AppError(400, 'Preço deve ser um número');
  }
  if (numero < 0) {
    throw new AppError(400, 'Preço não pode ser negativo');
  }
  // arredonda antes de comparar: 99999999.995 vira 100000000
  const preco = Math.round(numero * 100) / 100;
  // DECIMAL(10,2) aguenta até 99.999.999,99
  if (preco >= 100000000) {
    throw new AppError(400, 'Preço muito alto');
  }
  return preco;
}

// maior valor de uma coluna INT no MySQL
const MAIOR_INT = 2147483647;

function lerInteiroNaoNegativo(valor, campo) {
  const numero = paraNumero(valor);
  if (!Number.isInteger(numero) || numero < 0) {
    throw new AppError(400, `${campo} deve ser um número inteiro maior ou igual a zero`);
  }
  if (numero > MAIOR_INT) {
    throw new AppError(400, `${campo} é grande demais`);
  }
  return numero;
}

function limparCpf(cpf) {
  return String(cpf).replace(/\D/g, '');
}

// Confere os dois dígitos verificadores do CPF (algoritmo da Receita)
function cpfValido(cpf) {
  const numeros = limparCpf(cpf);
  if (!/^\d{11}$/.test(numeros)) return false;
  // 000.000.000-00, 111.111.111-11... passam na conta mas não existem
  if (/^(\d)\1{10}$/.test(numeros)) return false;

  for (let tamanho = 9; tamanho <= 10; tamanho++) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(numeros[i]) * (tamanho + 1 - i);
    }
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== Number(numeros[tamanho])) return false;
  }
  return true;
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Aceita só AAAA-MM-DD e confere se a data existe (31/02 não passa)
function lerData(valor, campo) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new AppError(400, `${campo} deve estar no formato AAAA-MM-DD`);
  }
  const data = new Date(`${valor}T00:00:00Z`);
  if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== valor) {
    throw new AppError(400, `${campo} não é uma data válida`);
  }
  return valor;
}

module.exports = {
  paraNumero,
  lerId,
  lerTexto,
  lerPreco,
  lerInteiroNaoNegativo,
  limparCpf,
  cpfValido,
  emailValido,
  lerData,
};
