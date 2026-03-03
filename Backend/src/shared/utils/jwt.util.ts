import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtConfig } from '../../config/jwt';

export interface JwtPayload {
  userId: string;
  email: string;
}

export class JwtUtil {
  static signAccessToken(payload: JwtPayload): string {
    const options: SignOptions = {
      expiresIn: jwtConfig.accessTokenExpiresIn,
    };
    return jwt.sign(payload, jwtConfig.secret, options);
  }

  static generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, jwtConfig.secret) as JwtPayload;
  }
}
