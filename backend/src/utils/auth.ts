import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const TOKEN_TTL = '12h';

export interface JwtPayload {
  userId: number;
  username: string;
}

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: JwtPayload, secret: string): string {
  return jwt.sign(payload, secret, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
