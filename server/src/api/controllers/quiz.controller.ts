import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { deleteImage, uploadImage } from '../../services/imageService.js';
import { toClientQuiz, toClientQuestion } from '../../utils/toClient.js';
import type { QuestionType, AnswerColor } from '../../generated/prisma/client.js';

export const listQuizzes = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));
  const where: Record<string, unknown> = { creatorId: req.user!._id };
  if (req.query.search) {
    where.OR = [
      { title: { contains: String(req.query.search), mode: 'insensitive' } },
      { description: { contains: String(req.query.search), mode: 'insensitive' } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.quiz.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.quiz.count({ where }),
  ]);
  res.json({ items: items.map(toClientQuiz), total, page, limit, pages: Math.ceil(total / limit) });
});

export const listPublicQuizzes = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));
  const where = { isPublic: true };
  const [items, total] = await Promise.all([
    prisma.quiz.findMany({
      where,
      orderBy: { statsTimesPlayed: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.quiz.count({ where }),
  ]);
  res.json({ items: items.map(toClientQuiz), total, page, limit, pages: Math.ceil(total / limit) });
});

export const getQuiz = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: req.params.id },
    include: { questions: { orderBy: { order: 'asc' }, include: { answers: true } } },
  });
  if (!quiz) throw ApiError.notFound('Quiz bulunamadı', 'QUIZ_NOT_FOUND');
  const isOwner = quiz.creatorId === req.user!._id;
  if (!quiz.isPublic && !isOwner) throw ApiError.forbidden('Bu quiz gizli', 'QUIZ_PRIVATE');
  const clientQuiz = toClientQuiz(quiz);
  clientQuiz.questions = quiz.questions.map(toClientQuestion);
  res.json({ quiz: clientQuiz });
});

export const createQuiz = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body;
  const questions = input.questions ?? [];
  const quiz = await prisma.quiz.create({
    data: {
      title: input.title,
      description: input.description ?? '',
      creatorId: req.user!._id,
      category: input.category ?? 'Genel',
      difficulty: input.difficulty ?? 'medium',
      tags: input.tags ?? [],
      isPublic: input.isPublic ?? false,
      settingsDefaultTimeLimit: input.settings?.defaultTimeLimit ?? 30,
      settingsShowAnswerAfterEach: input.settings?.showAnswerAfterEach ?? true,
      settingsRandomizeQuestions: input.settings?.randomizeQuestions ?? false,
      settingsRandomizeAnswers: input.settings?.randomizeAnswers ?? false,
      settingsMaxParticipants: input.settings?.maxParticipants ?? 0,
    },
  });

  if (questions.length > 0) {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i] as Record<string, unknown>;
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          type: (q.type as QuestionType) ?? 'multiple_choice',
          text: q.text as string,
          timeLimit: (q.timeLimit as number) ?? 30,
          points: (q.points as number) ?? 1000,
          explanation: (q.explanation as string) ?? '',
          order: i,
          imageUrl: (q.image as Record<string, string>)?.url ?? '',
          imagePublicId: (q.image as Record<string, string>)?.publicId ?? '',
          answers: q.answers
            ? {
                create: (q.answers as Array<Record<string, unknown>>).map((a) => ({
                  text: a.text as string,
                  isCorrect: a.isCorrect as boolean,
                  color: a.color as AnswerColor,
                })),
              }
            : undefined,
        },
      });
    }
  }

  const fullQuiz = await prisma.quiz.findUnique({
    where: { id: quiz.id },
    include: { questions: { orderBy: { order: 'asc' }, include: { answers: true } } },
  });
  if (!fullQuiz) throw ApiError.internal('Quiz oluşturulamadı');
  const clientQuiz = toClientQuiz(fullQuiz);
  clientQuiz.questions = fullQuiz.questions.map(toClientQuestion);
  res.status(201).json({ quiz: clientQuiz });
});

export const updateQuiz = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound('Quiz bulunamadı', 'QUIZ_NOT_FOUND');
  if (existing.creatorId !== req.user!._id) throw ApiError.forbidden();

  const body = req.body;
  const updateData: Record<string, unknown> = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.difficulty !== undefined) updateData.difficulty = body.difficulty;
  if (body.tags !== undefined) updateData.tags = body.tags;
  if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;
  if (body.settings) {
    if (body.settings.defaultTimeLimit !== undefined)
      updateData.settingsDefaultTimeLimit = body.settings.defaultTimeLimit;
    if (body.settings.showAnswerAfterEach !== undefined)
      updateData.settingsShowAnswerAfterEach = body.settings.showAnswerAfterEach;
    if (body.settings.randomizeQuestions !== undefined)
      updateData.settingsRandomizeQuestions = body.settings.randomizeQuestions;
    if (body.settings.randomizeAnswers !== undefined)
      updateData.settingsRandomizeAnswers = body.settings.randomizeAnswers;
    if (body.settings.maxParticipants !== undefined)
      updateData.settingsMaxParticipants = body.settings.maxParticipants;
  }

  const quiz = await prisma.quiz.update({ where: { id: req.params.id }, data: updateData });
  res.json({ quiz: toClientQuiz(quiz) });
});

export const deleteQuiz = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!quiz) throw ApiError.notFound('Quiz bulunamadı', 'QUIZ_NOT_FOUND');
  if (quiz.creatorId !== req.user!._id) throw ApiError.forbidden();
  await prisma.question.deleteMany({ where: { quizId: quiz.id } });
  if (quiz.coverImagePublicId) await deleteImage(quiz.coverImagePublicId);
  await prisma.quiz.delete({ where: { id: quiz.id } });
  res.json({ success: true });
});

export const duplicateQuiz = asyncHandler(async (req: Request, res: Response) => {
  const original = await prisma.quiz.findUnique({
    where: { id: req.params.id },
    include: { questions: { orderBy: { order: 'asc' }, include: { answers: true } } },
  });
  if (!original) throw ApiError.notFound('Quiz bulunamadı', 'QUIZ_NOT_FOUND');

  const copy = await prisma.quiz.create({
    data: {
      title: `${original.title} (kopya)`,
      description: original.description,
      creatorId: req.user!._id,
      category: original.category,
      difficulty: original.difficulty,
      tags: original.tags,
      isPublic: false,
      coverImageUrl: '',
      coverImagePublicId: '',
      settingsDefaultTimeLimit: original.settingsDefaultTimeLimit,
      settingsShowAnswerAfterEach: original.settingsShowAnswerAfterEach,
      settingsRandomizeQuestions: original.settingsRandomizeQuestions,
      settingsRandomizeAnswers: original.settingsRandomizeAnswers,
      settingsMaxParticipants: original.settingsMaxParticipants,
    },
  });

  if (original.questions.length > 0) {
    await prisma.question.createMany({
      data: original.questions.map((q, i) => ({
        quizId: copy.id,
        type: q.type,
        text: q.text,
        imageUrl: q.imageUrl,
        imagePublicId: q.imagePublicId,
        timeLimit: q.timeLimit,
        points: q.points,
        explanation: q.explanation,
        order: i,
      })),
    });
  }

  const fullCopy = await prisma.quiz.findUnique({
    where: { id: copy.id },
    include: { questions: { orderBy: { order: 'asc' }, include: { answers: true } } },
  });
  if (!fullCopy) throw ApiError.internal('Quiz kopyalanamadı');
  const clientCopy = toClientQuiz(fullCopy);
  clientCopy.questions = fullCopy.questions.map(toClientQuestion);
  res.status(201).json({ quiz: clientCopy });
});

export const addQuestion = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!quiz) throw ApiError.notFound('Quiz bulunamadı', 'QUIZ_NOT_FOUND');
  if (quiz.creatorId !== req.user!._id) throw ApiError.forbidden();

  const questionCount = await prisma.question.count({ where: { quizId: quiz.id } });
  const q = await prisma.question.create({
    data: {
      quizId: quiz.id,
      type: req.body.type ?? 'multiple_choice',
      text: req.body.text,
      imageUrl: req.body.image?.url ?? '',
      imagePublicId: req.body.image?.publicId ?? '',
      timeLimit: req.body.timeLimit ?? 30,
      points: req.body.points ?? 1000,
      explanation: req.body.explanation ?? '',
      order: questionCount,
      answers: req.body.answers
        ? {
            create: req.body.answers.map((a: Record<string, unknown>) => ({
              text: a.text as string,
              isCorrect: a.isCorrect as boolean,
              color: a.color as 'red' | 'blue' | 'yellow' | 'green',
            })),
          }
        : undefined,
    },
    include: { answers: true },
  });
  res.status(201).json({ question: toClientQuestion(q) });
});

export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!quiz) throw ApiError.notFound('Quiz bulunamadı', 'QUIZ_NOT_FOUND');
  if (quiz.creatorId !== req.user!._id) throw ApiError.forbidden();

  const existing = await prisma.question.findFirst({
    where: { id: req.params.qId, quizId: quiz.id },
  });
  if (!existing) throw ApiError.notFound('Soru bulunamadı', 'QUESTION_NOT_FOUND');

  const body = req.body;
  const updateData: Record<string, unknown> = {};
  if (body.type !== undefined) updateData.type = body.type;
  if (body.text !== undefined) updateData.text = body.text;
  if (body.timeLimit !== undefined) updateData.timeLimit = body.timeLimit;
  if (body.points !== undefined) updateData.points = body.points;
  if (body.explanation !== undefined) updateData.explanation = body.explanation;
  if (body.image) {
    if (existing.imagePublicId && body.image.url !== existing.imageUrl) {
      await deleteImage(existing.imagePublicId);
    }
    updateData.imageUrl = body.image.url ?? '';
    updateData.imagePublicId = body.image.publicId ?? '';
  }

  if (body.answers) {
    await prisma.answer.deleteMany({ where: { questionId: existing.id } });
    await prisma.answer.createMany({
      data: body.answers.map((a: Record<string, unknown>) => ({
        questionId: existing.id,
        text: a.text as string,
        isCorrect: a.isCorrect as boolean,
        color: a.color as 'red' | 'blue' | 'yellow' | 'green',
      })),
    });
  }

  const q = await prisma.question.update({
    where: { id: existing.id },
    data: updateData,
    include: { answers: true },
  });
  res.json({ question: toClientQuestion(q) });
});

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!quiz) throw ApiError.notFound('Quiz bulunamadı', 'QUIZ_NOT_FOUND');
  if (quiz.creatorId !== req.user!._id) throw ApiError.forbidden();
  const question = await prisma.question.findFirst({
    where: { id: req.params.qId, quizId: quiz.id },
  });
  if (question?.imagePublicId) await deleteImage(question.imagePublicId);
  await prisma.answer.deleteMany({ where: { questionId: req.params.qId } });
  await prisma.question.deleteMany({ where: { id: req.params.qId, quizId: quiz.id } });
  res.json({ success: true });
});

export const reorderQuestions = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!quiz) throw ApiError.notFound('Quiz bulunamadı', 'QUIZ_NOT_FOUND');
  if (quiz.creatorId !== req.user!._id) throw ApiError.forbidden();
  const { orderedIds } = req.body as { orderedIds: string[] };
  await Promise.all(
    orderedIds.map((id, i) => prisma.question.update({ where: { id }, data: { order: i } })),
  );
  res.json({ success: true });
});

export const uploadCover = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!quiz) throw ApiError.notFound('Quiz bulunamadı', 'QUIZ_NOT_FOUND');
  if (quiz.creatorId !== req.user!._id) throw ApiError.forbidden();
  const file = req.file;
  if (!file) throw ApiError.badRequest('Dosya gerekli', 'NO_FILE');
  const { assertImageFile } = await import('../../services/imageService.js');
  assertImageFile(file);
  if (quiz.coverImagePublicId) await deleteImage(quiz.coverImagePublicId);
  const { url, publicId } = await uploadImage(file.buffer, `quizarena/quizzes/${quiz.id}`);
  await prisma.quiz.update({
    where: { id: quiz.id },
    data: { coverImageUrl: url, coverImagePublicId: publicId },
  });
  res.json({ url, publicId });
});

export const uploadQuestionImage = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!quiz) throw ApiError.notFound('Quiz bulunamadı', 'QUIZ_NOT_FOUND');
  if (quiz.creatorId !== req.user!._id) throw ApiError.forbidden();
  const question = await prisma.question.findFirst({
    where: { id: req.params.qId, quizId: quiz.id },
  });
  if (!question) throw ApiError.notFound('Soru bulunamadı', 'QUESTION_NOT_FOUND');
  const file = req.file;
  if (!file) throw ApiError.badRequest('Dosya gerekli', 'NO_FILE');
  const { assertImageFile } = await import('../../services/imageService.js');
  assertImageFile(file);
  if (question.imagePublicId) await deleteImage(question.imagePublicId);
  const { url, publicId } = await uploadImage(
    file.buffer,
    `quizarena/quizzes/${quiz.id}/questions`,
  );
  const updated = await prisma.question.update({
    where: { id: question.id },
    data: { imageUrl: url, imagePublicId: publicId },
    include: { answers: true },
  });
  res.json({ url, publicId, question: toClientQuestion(updated) });
});
