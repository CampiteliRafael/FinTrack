import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Schema de validação para environment variables
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform(Number),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),

  // Frontend
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform(Number),
});

// Validar environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      /* eslint-disable no-console */
      console.error('❌ Invalid environment variables:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\nPlease check your .env file and ensure all required variables are set.');
      console.error('See .env.example for reference.\n');
      /* eslint-enable no-console */
    }
    process.exit(1);
  }
}

// Exportar variáveis validadas
export const env = validateEnv();

// Type-safe access
export type Env = z.infer<typeof envSchema>;
