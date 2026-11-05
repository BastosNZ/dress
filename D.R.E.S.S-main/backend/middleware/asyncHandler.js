// Envolve uma rota async e manda qualquer erro pro errorHandler.
// Assim não precisa de try/catch repetido em cada rota.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
