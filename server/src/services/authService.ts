import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { config } from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/prisma.js';

import type { User } from '../generated/prisma/client.js';

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function generateAccessToken(userId: string): string {
  return jwt.sign({ sub: String(userId), type: 'access' }, config.jwt.secret, {
    expiresIn: config.jwt.accessExpires as SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(userId: string): { token: string; hash: string } {
  const token = jwt.sign({ sub: String(userId), type: 'refresh' }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpires as SignOptions['expiresIn'],
  });
  const hash = hashToken(token);
  return { token, hash };
}

export function verifyAccessToken(token: string): { sub: string } {
  try {
    const payload = jwt.verify(token, config.jwt.secret) as { sub: string; type: string };
    if (payload.type !== 'access') throw ApiError.unauthorized('Geçersiz token tipi');
    return { sub: payload.sub };
  } catch {
    throw ApiError.unauthorized('Geçersiz veya süresi dolmuş token');
  }
}

export function verifyRefreshToken(token: string): { sub: string } {
  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret) as { sub: string; type: string };
    if (payload.type !== 'refresh') throw ApiError.unauthorized('Geçersiz token tipi');
    return { sub: payload.sub };
  } catch {
    throw ApiError.unauthorized('Geçersiz veya süresi dolmuş refresh token');
  }
}

function hashToken(token: string): string {
  return bcrypt.hashSync(token, 10);
}

function tokenMatchesHash(token: string, hash: string): boolean {
  if (!hash) return false;
  return bcrypt.compareSync(token, hash);
}

interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role?: 'teacher' | 'student';
}): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) throw ApiError.conflict('Bu e-posta zaten kayıtlı', 'EMAIL_EXISTS');

  const password = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      password,
      role: input.role ?? 'teacher',
    },
  });

  const accessToken = generateAccessToken(user.id);
  const { token: refreshToken, hash } = generateRefreshToken(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: hash } });
  return { user, accessToken, refreshToken };
}

export async function loginUser(email: string, passwordInput: string): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw ApiError.unauthorized('Geçersiz kimlik bilgileri', 'INVALID_CREDENTIALS');

  const valid = await comparePassword(passwordInput, user.password);
  if (!valid) throw ApiError.unauthorized('Geçersiz kimlik bilgileri', 'INVALID_CREDENTIALS');

  const accessToken = generateAccessToken(user.id);
  const { token: refreshToken, hash } = generateRefreshToken(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: hash } });
  return { user, accessToken, refreshToken };
}

export async function refreshTokens(refreshToken: string): Promise<AuthResult> {
  const { sub } = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: sub } });
  if (!user) throw ApiError.unauthorized('Kullanıcı bulunamadı');
  if (!tokenMatchesHash(refreshToken, user.refreshToken)) {
    throw ApiError.unauthorized('Geçersiz refresh token', 'INVALID_REFRESH');
  }

  const accessToken = generateAccessToken(user.id);
  const { token: newRefresh, hash } = generateRefreshToken(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: hash } });
  return { user, accessToken, refreshToken: newRefresh };
}

export async function logoutUser(refreshToken: string): Promise<void> {
  try {
    const { sub } = verifyRefreshToken(refreshToken);
    await prisma.user.update({ where: { id: sub }, data: { refreshToken: '' } });
  } catch {
    // silent
  }
}

export function generateEmailVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export async function getUserById(userId: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('Kullanıcı bulunamadı', 'USER_NOT_FOUND');
  return user;
}
