// Garante que os dados de exemplo respeitam as mesmas regras da API.
// Antes 4 dos 5 CPFs do seed não passavam no dígito verificador.
const fs = require('fs');
const path = require('path');
const { cpfValido } = require('../utils/validacao');

const arquivosSeed = [
  path.join(__dirname, '../config/initDatabase.js'),
  path.join(__dirname, '../../database/seed.sql'),
];

describe('dados de exemplo (seed)', () => {
  test.each(arquivosSeed)('todos os CPFs de %s são válidos', (arquivo) => {
    const texto = fs.readFileSync(arquivo, 'utf8');
    const cpfs = [...texto.matchAll(/'(\d{11})'/g)].map((m) => m[1]);

    expect(cpfs.length).toBeGreaterThan(0);
    for (const cpf of cpfs) {
      expect({ cpf, valido: cpfValido(cpf) }).toEqual({ cpf, valido: true });
    }
  });
});
