import bcrypt from 'bcrypt';
import { logDebug } from '../../config/logger';

export class HashUtil {
  static async hash(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    logDebug('Password comparison started');
    const result = await bcrypt.compare(password, hash);
    logDebug('Password comparison completed', { matched: result });
    return result;
  }
}
