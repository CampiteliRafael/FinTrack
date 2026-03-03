import { env } from './env';

export const jwtConfig = {
  secret: env.JWT_SECRET,
  accessTokenExpiresIn: '15m',
  refreshTokenExpiresIn: '7d',
};
