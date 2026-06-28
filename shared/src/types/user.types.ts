export type UserRole = 'teacher' | 'student';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: {
    url: string;
    publicId: string;
  } | null;
  isEmailVerified: boolean;
  stats: {
    totalGamesHosted: number;
    totalGamesPlayed: number;
    totalQuestionsAnswered: number;
    correctAnswers: number;
    highScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: Omit<User, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string };
  accessToken: string;
}
