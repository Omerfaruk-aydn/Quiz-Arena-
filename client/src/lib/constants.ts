export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';

export const STORAGE_KEYS = {
  accessToken: 'qa_access_token',
  pin: 'qa_last_pin',
  participant: 'qa_participant',
} as const;

export const ROUTES = {
  landing: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  quizzes: '/quizzes',
  quizCreate: '/quizzes/new',
  quizEdit: '/quizzes/:id/edit',
  publicQuizzes: '/library',
  gameHost: '/host/:pin',
  gameJoin: '/join',
  gamePlayer: '/play/:pin',
  gameReport: '/report/:pin',
  profile: '/profile',
  resetPassword: '/reset-password',
} as const;

export const CATEGORIES = [
  'Genel Kültür',
  'Matematik',
  'Fen Bilimleri',
  'Tarih',
  'Coğrafya',
  'Edebiyat',
  'İngilizce',
  'Müzik',
  'Spor',
  'Teknoloji',
  'Sanat',
  'Diğer',
] as const;

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor',
};

export const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-correct/20 text-correct border-correct/40',
  medium: 'bg-accent-amber/20 text-accent-amber border-accent-amber/40',
  hard: 'bg-wrong/20 text-wrong border-wrong/40',
};

export const ANSWER_SHAPE_ICONS = {
  red: '▲',
  blue: '●',
  yellow: '■',
  green: '♦',
} as const;

export const TOAST_DURATION = 3500;
