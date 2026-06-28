import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'En az 2 karakter').max(60),
  email: z.string().trim().email('Geçerli bir e-posta girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter').max(128),
  role: z.enum(['teacher', 'student']).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta girin').toLowerCase(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
