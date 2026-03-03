import { Request, Response, NextFunction } from 'express';
import zlib from 'zlib';

export function compressionMiddleware(req: Request, res: Response, next: NextFunction) {
  const acceptEncoding = req.headers['accept-encoding'] || '';

  if (!acceptEncoding.includes('gzip')) {
    return next();
  }

  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function (data: any) {
    if (typeof data === 'string' && data.length > 1024) {
      const compressed = zlib.gzipSync(data);
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Length', compressed.length.toString());
      return originalSend.call(this, compressed);
    }
    return originalSend.call(this, data);
  };

  res.json = function (data: any) {
    const jsonString = JSON.stringify(data);
    if (jsonString.length > 1024) {
      const compressed = zlib.gzipSync(jsonString);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Length', compressed.length.toString());
      return originalSend.call(this, compressed);
    }
    return originalJson.call(this, data);
  };

  next();
}
