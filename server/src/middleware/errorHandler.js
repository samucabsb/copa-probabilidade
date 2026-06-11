export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Rota não encontrada.' });
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Erro interno do servidor.' : error.message,
    detail: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
}
