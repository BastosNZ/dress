const AppError = require('../utils/AppError');

// Erros do MySQL que dá pra explicar pro usuário sem mostrar a mensagem crua do banco
const errosMysql = {
  ER_DUP_ENTRY: [409, 'Registro duplicado'],
  ER_ROW_IS_REFERENCED: [409, 'Registro está em uso e não pode ser removido'],
  ER_ROW_IS_REFERENCED_2: [409, 'Registro está em uso e não pode ser removido'],
  ER_NO_REFERENCED_ROW: [400, 'Registro relacionado não existe'],
  ER_NO_REFERENCED_ROW_2: [400, 'Registro relacionado não existe'],
  ER_DATA_TOO_LONG: [400, 'Valor maior que o permitido para o campo'],
  ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: [400, 'Valor inválido para o campo'],
  WARN_DATA_TRUNCATED: [400, 'Valor inválido para o campo'],
  ER_TRUNCATED_WRONG_VALUE: [400, 'Valor inválido para o campo'],
  ER_WARN_DATA_OUT_OF_RANGE: [400, 'Valor fora do limite permitido'],
};

// O Express só trata como middleware de erro se tiver os 4 parâmetros,
// por isso o "next" fica aqui mesmo sem ser usado.
function errorHandler(err, req, res, next) {
  // JSON mal formatado no corpo (vem do express.json)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ erro: 'Corpo da requisição muito grande' });
  }
  // outros erros do express.json (charset, encoding...) já vêm com status 4xx
  if (err.type && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ erro: 'Requisição inválida' });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ erro: err.message });
  }

  const erroMysql = errosMysql[err.code];
  if (erroMysql) {
    return res.status(erroMysql[0]).json({ erro: erroMysql[1] });
  }

  // Erro que não esperávamos: loga no servidor e não vaza detalhe pro cliente
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}

module.exports = errorHandler;
