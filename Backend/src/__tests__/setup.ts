import { beforeAll, afterAll, beforeEach } from '@jest/globals';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
});

afterAll(async () => {});

beforeEach(async () => {});
