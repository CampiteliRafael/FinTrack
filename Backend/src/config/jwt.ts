import { env } from './env';

export const jwtConfig = {
  secret: env.JWT_SECRET,
  accessTokenExpiresIn: '15m' as string,
  refreshTokenExpiresIn: '7d' as string,
};
