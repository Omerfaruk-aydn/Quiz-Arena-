import type { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  getUserById,
} from '../../services/authService.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendPasswordResetEmail } from '../../services/emailService.js';
import { randomBytes, createHash } from 'crypto';
import { prisma } from '../../config/prisma.js';

const REFRESH_COOKIE = 'rt';
const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge,
  path: '/api/auth',
});

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  avatarUrl: string;
  avatarPublicId: string;
  statsTotalGamesHosted: number;
  statsTotalGamesPlayed: number;
  statsTotalQuestionsAnswered: number;
  statsCorrectAnswers: number;
  statsHighScore: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    avatar: user.avatarUrl ? { url: user.avatarUrl, publicId: user.avatarPublicId } : null,
    stats: {
      totalGamesHosted: user.statsTotalGamesHosted,
      totalGamesPlayed: user.statsTotalGamesPlayed,
      totalQuestionsAnswered: user.statsTotalQuestionsAnswered,
      correctAnswers: user.statsCorrectAnswers,
      highScore: user.statsHighScore,
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body;
  const { user, accessToken, refreshToken } = await registerUser(input);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
  res.status(201).json({
    user: toPublicUser(user),
    accessToken,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await loginUser(email, password);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
  res.json({ user: toPublicUser(user), accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
  if (!refreshToken) throw ApiError.unauthorized('Refresh token gerekli', 'NO_REFRESH');
  const { user, accessToken, refreshToken: newRefresh } = await refreshTokens(refreshToken);
  res.cookie(REFRESH_COOKIE, newRefresh, cookieOptions(7 * 24 * 60 * 60 * 1000));
  res.json({ user: toPublicUser(user), accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (refreshToken) await logoutUser(refreshToken);
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.json({ success: true });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserById(req.user!._id);
  res.json({ user: toPublicUser(user) });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const raw = randomBytes(32).toString('hex');
    const hash = createHash('sha256').update(raw).digest('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hash,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const url = `${process.env.CLIENT_URL}/reset-password?token=${raw}`;
    await sendPasswordResetEmail(user.email, url);
  }
  res.json({ success: true, message: 'Şifre sıfırlama talimatları e-posta ile gönderildi' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const hash = createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hash,
      passwordResetExpires: { gt: new Date() },
    },
  });
  if (!user) throw ApiError.badRequest('Token geçersiz veya süresi dolmuş', 'INVALID_TOKEN');
  const { hashPassword } = await import('../../services/authService.js');
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(password),
      passwordResetToken: '',
      passwordResetExpires: null,
    },
  });
  res.json({ success: true });
});
