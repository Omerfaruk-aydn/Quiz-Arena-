import type { Request, Response } from 'express';
import { createGameSession } from '../../services/gameSessionService.js';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createGame = asyncHandler(async (req: Request, res: Response) => {
  const session = await createGameSession({
    quizId: req.body.quizId,
    hostId: req.user!._id,
    settings: req.body.settings,
  });
  res.status(201).json({
    pin: session.pin,
    sessionId: session.id,
    status: session.status,
  });
});

export const getGameByPin = asyncHandler(async (req: Request, res: Response) => {
  const session = await prisma.gameSession.findUnique({
    where: { pin: req.params.pin },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          description: true,
          coverImageUrl: true,
          difficulty: true,
          category: true,
        },
      },
    },
  });
  if (!session) throw ApiError.notFound('Oyun bulunamadı', 'GAME_NOT_FOUND');
  const participantsCount = await prisma.gameParticipant.count({
    where: { sessionId: session.id, isConnected: true },
  });
  res.json({ session, participantsCount });
});

export const getGameReport = asyncHandler(async (req: Request, res: Response) => {
  const session = await prisma.gameSession.findFirst({
    where: { pin: req.params.pin, status: 'finished' },
    include: { quiz: true },
  });
  if (!session) throw ApiError.notFound('Rapor bulunamadı', 'REPORT_NOT_FOUND');
  if (session.hostId !== req.user!._id) throw ApiError.forbidden();
  const participants = await prisma.gameParticipant.findMany({
    where: { sessionId: session.id },
    orderBy: { rank: 'asc' },
    include: { answers: true },
  });
  const answers = await prisma.gameAnswer.findMany({
    where: { sessionId: session.id },
  });
  res.json({ session, participants, answers });
});

export const listGameHistory = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));
  const where = { hostId: req.user!._id, status: 'finished' as const };
  const [items, total] = await Promise.all([
    prisma.gameSession.findMany({
      where,
      include: { quiz: { select: { id: true, title: true, category: true, difficulty: true } } },
      orderBy: { finishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.gameSession.count({ where }),
  ]);
  res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
});
