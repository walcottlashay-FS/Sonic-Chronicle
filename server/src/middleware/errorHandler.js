export function notFound(req, res) {
  res.status(404).json({ error: 'not_found', message: `No route for ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error('Request failed:', error.message);
  const status = Number.isInteger(error.status) ? error.status : 500;
  res.status(status).json({
    error: status === 500 ? 'internal_server_error' : 'request_failed',
    message: status === 500 ? 'The server could not complete the request.' : error.message,
    ...(error.retryAfter ? { retryAfterSeconds: Number(error.retryAfter) } : {}),
  });
}
