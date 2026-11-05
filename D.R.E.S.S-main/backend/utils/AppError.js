// Erro "esperado" da aplicação: já sabe qual status HTTP devolver.
// Qualquer outro erro que chegar no errorHandler vira 500.
class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

module.exports = AppError;
