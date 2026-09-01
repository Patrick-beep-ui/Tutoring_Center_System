// @vitest-environment node
import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateToken } from '../jwt.js';

const SECRET = process.env.SECRET_KEY;

describe('generateToken', () => {
  const user = { user_id: 7, email: 't@example.com', role: 'tutor' };

  it('produces a token carrying the user payload fields', () => {
    const token = generateToken(user);
    const decoded = jwt.verify(token, SECRET);
    expect(decoded.user_id).toBe(user.user_id);
    expect(decoded.email).toBe(user.email);
    expect(decoded.role).toBe(user.role);
  });

  it('token is verifiable with the configured secret', () => {
    const token = generateToken(user);
    expect(() => jwt.verify(token, SECRET)).not.toThrow();
  });

  it('token expires in ~2 hours', () => {
    const token = generateToken(user);
    const decoded = jwt.verify(token, SECRET);
    const ttl = decoded.exp - decoded.iat;
    expect(ttl).toBe(2 * 60 * 60);
  });
});
