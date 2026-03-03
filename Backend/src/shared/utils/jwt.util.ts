import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtConfig } from '../../config/jwt';

export interface JwtPayload {
  userId: string;
  email: string;
}

export class JwtUtil {
  static signAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.accessTokenExpiresIn,
    });
  }

  static generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, jwtConfig.secret) as JwtPayload;
  }
}
