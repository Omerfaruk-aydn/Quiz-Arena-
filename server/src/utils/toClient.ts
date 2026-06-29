/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyObj = Record<string, any>;

export function toClient<T extends AnyObj>(obj: T): T & { _id: string } {
  const { id, ...rest } = obj;
  return { ...rest, _id: id } as T & { _id: string };
}

export function toClientArray<T extends AnyObj>(arr: T[]): (T & { _id: string })[] {
  return arr.map(toClient);
}

export function toClientQuiz(quiz: AnyObj): AnyObj {
  const {
    id,
    settingsDefaultTimeLimit,
    settingsShowAnswerAfterEach,
    settingsRandomizeQuestions,
    settingsRandomizeAnswers,
    settingsMaxParticipants,
    statsTimesPlayed,
    statsAverageScore,
    statsTotalParticipants,
    coverImagePublicId,
    ...rest
  } = quiz;
  return {
    ...rest,
    _id: id,
    gameMode: quiz.gameMode ?? 'classic',
    modeSettings: (quiz.modeSettings as Record<string, unknown>) ?? {},
    coverImage: quiz.coverImageUrl
      ? { url: quiz.coverImageUrl, publicId: coverImagePublicId }
      : null,
    settings: {
      defaultTimeLimit: settingsDefaultTimeLimit,
      showAnswerAfterEach: settingsShowAnswerAfterEach,
      randomizeQuestions: settingsRandomizeQuestions,
      randomizeAnswers: settingsRandomizeAnswers,
      maxParticipants: settingsMaxParticipants,
    },
    stats: {
      timesPlayed: statsTimesPlayed,
      averageScore: statsAverageScore,
      totalParticipants: statsTotalParticipants,
    },
  };
}

export function toClientQuestion(q: AnyObj): AnyObj {
  const { id, imageUrl, imagePublicId, ...rest } = q;
  return {
    ...rest,
    _id: id,
    image: imageUrl ? { url: imageUrl, publicId: imagePublicId } : null,
    answers: (q.answers ?? []).map((a: AnyObj) => ({
      _id: a.id,
      text: a.text,
      isCorrect: a.isCorrect,
      color: a.color,
    })),
  };
}

export function toClientUser(user: AnyObj): AnyObj {
  const {
    id,
    avatarUrl,
    avatarPublicId,
    refreshToken,
    emailVerificationToken,
    passwordResetToken,
    passwordResetExpires,
    statsTotalGamesHosted,
    statsTotalGamesPlayed,
    statsTotalQuestionsAnswered,
    statsCorrectAnswers,
    statsHighScore,
    ...rest
  } = user;
  return {
    ...rest,
    _id: id,
    avatar: avatarUrl ? { url: avatarUrl, publicId: avatarPublicId } : null,
    stats: {
      totalGamesHosted: statsTotalGamesHosted,
      totalGamesPlayed: statsTotalGamesPlayed,
      totalQuestionsAnswered: statsTotalQuestionsAnswered,
      correctAnswers: statsCorrectAnswers,
      highScore: statsHighScore,
    },
  };
}
