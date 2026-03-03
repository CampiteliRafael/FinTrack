import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    if (duration > 1000) {
      console.warn(`[SLOW REQUEST] ${req.method} ${req.path} - ${duration}ms`);
    }
  });

  next();
}
