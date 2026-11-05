const { cpfValido, lerData, paraNumero } = require('../utils/validacao');

describe('validacao', () => {
  test('cpfValido confere os dígitos verificadores', () => {
    expect(cpfValido('52998224725')).toBe(true);
    expect(cpfValido('529.982.247-25')).toBe(true);
    expect(cpfValido('52998224724')).toBe(false);
    expect(cpfValido('11111111111')).toBe(false);
    expect(cpfValido('123')).toBe(false);
  });

  test('lerData só aceita datas que existem', () => {
    expect(lerData('2026-11-05', 'Data')).toBe('2026-11-05');
    expect(() => lerData('2026-02-30', 'Data')).toThrow('não é uma data válida');
    expect(() => lerData('2026-1-5', 'Data')).toThrow('formato AAAA-MM-DD');
  });

  test('paraNumero não transforma vazio ou booleano em número', () => {
    expect(paraNumero('10.5')).toBe(10.5);
    expect(paraNumero('')).toBeNaN();
    expect(paraNumero(' ')).toBeNaN();
    expect(paraNumero(true)).toBeNaN();
    expect(paraNumero(null)).toBeNaN();
  });
});
