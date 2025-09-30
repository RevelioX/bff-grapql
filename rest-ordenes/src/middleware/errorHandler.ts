import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err); // Se podría sustituir por logger estructurado
  if (res.headersSent) return;
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Error interno inesperado' });
}
