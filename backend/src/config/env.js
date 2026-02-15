import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '../.env' });

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  RPC_URL: z.string().url(),
  BETTING_CONTRACT_ADDRESS: z.string().min(42),
  PLATFORM_FEE_BPS: z.coerce.number().min(200).max(500),
  CORS_ORIGIN: z.string().default('http://localhost:5173')
});

export const env = schema.parse(process.env);
