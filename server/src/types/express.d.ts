import type { User } from '@quizarena/shared';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface AuthenticatedUser {
  _id: string;
  role: User['role'];
  name: string;
  email: string;
}
