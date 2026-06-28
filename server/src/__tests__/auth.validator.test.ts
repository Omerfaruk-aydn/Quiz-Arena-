import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../api/validators/auth.validator.js';

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse({
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        password: 'securepass123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject name shorter than 2 characters', () => {
      const result = registerSchema.safeParse({
        name: 'A',
        email: 'ahmet@example.com',
        password: 'securepass123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        name: 'Ahmet',
        email: 'not-an-email',
        password: 'securepass123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = registerSchema.safeParse({
        name: 'Ahmet',
        email: 'ahmet@example.com',
        password: 'short',
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional role field', () => {
      const result = registerSchema.safeParse({
        name: 'Ahmet',
        email: 'ahmet@example.com',
        password: 'securepass123',
        role: 'student',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'ahmet@example.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'ahmet@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });

    it('should lowercase email', () => {
      const result = loginSchema.safeParse({
        email: 'AHMET@EXAMPLE.COM',
        password: 'anypassword',
      });
      if (result.success) {
        expect(result.data.email).toBe('ahmet@example.com');
      }
    });
  });

  describe('refreshSchema', () => {
    it('should accept valid refresh token', () => {
      const result = refreshSchema.safeParse({ refreshToken: 'some-token' });
      expect(result.success).toBe(true);
    });

    it('should reject empty token', () => {
      const result = refreshSchema.safeParse({ refreshToken: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should accept valid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'ahmet@example.com' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should accept valid reset data', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'some-reset-token',
        password: 'newsecurepass123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short password', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'some-reset-token',
        password: 'short',
      });
      expect(result.success).toBe(false);
    });
  });
});
