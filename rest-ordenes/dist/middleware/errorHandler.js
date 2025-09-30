export function errorHandler(err, _req, res, _next) {
    console.error(err); // Se podría sustituir por logger estructurado
    if (res.headersSent)
        return;
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Error interno inesperado' });
}
