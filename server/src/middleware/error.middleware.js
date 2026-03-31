export function notFound(req, res) {
  res.status(404).json({ message: `Not Found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
}
