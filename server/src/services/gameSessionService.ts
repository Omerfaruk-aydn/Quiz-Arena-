import { prisma } from '../config/prisma.js';
import { generateUniquePIN } from '../utils/generatePIN.js';
import { ApiError } from '../utils/ApiError.js';

export interface CreateSessionInput {
  quizId: string;
  hostId: string;
  settings?: {
    timeLimit?: number;
    showAnswerAfterEach?: boolean;
    randomizeQuestions?: boolean;
    randomizeAnswers?: boolean;
    maxParticipants?: number;
  };
}

export async function createGameSession(input: CreateSessionInput) {
  const quiz = await prisma.quiz.findUnique({ where: { id: input.quizId } });
  if (!quiz) throw ApiError.notFound('Quiz bulunamadı', 'QUIZ_NOT_FOUND');

  const pin = await generateUniquePIN(async (p) => {
    const exists = await prisma.gameSession.findFirst({
      where: { pin: p, status: { not: 'finished' } },
    });
    return !!exists;
  });

  const questionIds = await prisma.question.findMany({
    where: { quizId: input.quizId },
    orderBy: { order: 'asc' },
    select: { id: true },
  });

  type QuestionId = { id: string };

  const session = await prisma.gameSession.create({
    data: {
      pin,
      quizId: input.quizId,
      hostId: input.hostId,
      status: 'lobby',
      gameMode: quiz.gameMode,
      modeSettings: quiz.modeSettings ?? {},
      currentQuestionIndex: 0,
      settingsTimeLimit: input.settings?.timeLimit ?? quiz.settingsDefaultTimeLimit,
      settingsShowAnswerAfterEach:
        input.settings?.showAnswerAfterEach ?? quiz.settingsShowAnswerAfterEach,
      settingsRandomizeQuestions:
        input.settings?.randomizeQuestions ?? quiz.settingsRandomizeQuestions,
      settingsRandomizeAnswers: input.settings?.randomizeAnswers ?? quiz.settingsRandomizeAnswers,
      settingsMaxParticipants: input.settings?.maxParticipants ?? quiz.settingsMaxParticipants,
      questionOrder: {
        connect: questionIds.map((q: QuestionId) => ({ id: q.id })),
      },
    },
    include: { quiz: true, questionOrder: true },
  });

  return session;
}

export async function getSessionByPin(pin: string) {
  const session = await prisma.gameSession.findUnique({
    where: { pin },
    include: {
      quiz: {
        include: {
          questions: { orderBy: { order: 'asc' } },
        },
      },
    },
  });
  return session;
}

export async function addParticipant(
  sessionId: string,
  data: { nickname: string; emoji: string; color: string; socketId: string; userId?: string },
) {
  const participant = await prisma.gameParticipant.create({
    data: {
      sessionId,
      userId: data.userId ?? null,
      nickname: data.nickname,
      avatarEmoji: data.emoji,
      avatarColor: data.color,
      socketId: data.socketId,
    },
  });
  return participant;
}

export async function recordAnswer(input: {
  sessionId: string;
  participantId: string;
  questionId: string;
  selectedAnswer: number | null;
  isCorrect: boolean;
  responseTime: number;
  pointsEarned: number;
}) {
  const answer = await prisma.gameAnswer.create({
    data: {
      sessionId: input.sessionId,
      participantId: input.participantId,
      questionId: input.questionId,
      selectedAnswer: input.selectedAnswer,
      isCorrect: input.isCorrect,
      responseTime: input.responseTime,
      pointsEarned: input.pointsEarned,
    },
  });

  await prisma.gameParticipant.update({
    where: { id: input.participantId },
    data: {
      totalScore: { increment: input.pointsEarned },
      streak: input.isCorrect ? { increment: 1 } : { set: 0 },
    },
  });

  return answer;
}

export async function finalizeSession(sessionId: string) {
  const participants = await prisma.gameParticipant.findMany({
    where: { sessionId },
    orderBy: { totalScore: 'desc' },
  });

  for (let i = 0; i < participants.length; i++) {
    await prisma.gameParticipant.update({
      where: { id: participants[i].id },
      data: { rank: i + 1 },
    });
  }

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { status: 'finished', finishedAt: new Date() },
  });

  return participants;
}
