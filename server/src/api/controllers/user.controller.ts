import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { uploadImage, deleteImage, assertImageFile } from '../../services/imageService.js';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!._id },
    select: {
      statsTotalGamesHosted: true,
      statsTotalGamesPlayed: true,
      statsTotalQuestionsAnswered: true,
      statsCorrectAnswers: true,
      statsHighScore: true,
    },
  });
  res.json({
    stats: {
      totalGamesHosted: user?.statsTotalGamesHosted ?? 0,
      totalGamesPlayed: user?.statsTotalGamesPlayed ?? 0,
      totalQuestionsAnswered: user?.statsTotalQuestionsAnswered ?? 0,
      correctAnswers: user?.statsCorrectAnswers ?? 0,
      highScore: user?.statsHighScore ?? 0,
    },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!._id } });
  if (!user) throw ApiError.notFound('Kullanıcı yok');

  const updateData: Record<string, unknown> = {};
  if (typeof req.body.name === 'string') updateData.name = req.body.name;
  if (typeof req.body.email === 'string') updateData.email = req.body.email.toLowerCase();

  const updated = await prisma.user.update({ where: { id: user.id }, data: updateData });
  res.json({
    user: {
      _id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isEmailVerified: updated.isEmailVerified,
      avatar: updated.avatarUrl
        ? { url: updated.avatarUrl, publicId: updated.avatarPublicId }
        : null,
      stats: {
        totalGamesHosted: updated.statsTotalGamesHosted,
        totalGamesPlayed: updated.statsTotalGamesPlayed,
        totalQuestionsAnswered: updated.statsTotalQuestionsAnswered,
        correctAnswers: updated.statsCorrectAnswers,
        highScore: updated.statsHighScore,
      },
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    },
  });
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!._id } });
  if (!user) throw ApiError.notFound('Kullanıcı yok');
  const file = req.file;
  if (!file) throw ApiError.badRequest('Dosya gerekli', 'NO_FILE');
  assertImageFile(file);
  if (user.avatarPublicId) await deleteImage(user.avatarPublicId);
  const { url, publicId } = await uploadImage(file.buffer, `quizarena/avatars/${user.id}`);
  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl: url, avatarPublicId: publicId },
  });
  res.json({ url, publicId });
});
