import rateLimit from 'express-rate-limit';

// Limites mais altos para desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 10000 : 100, // 10000 em dev, 100 em prod
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDevelopment, // Skip rate limiting em desenvolvimento
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDevelopment ? 1000 : 5, // 1000 em dev, 5 em prod
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => isDevelopment, // Skip rate limiting em desenvolvimento
});
