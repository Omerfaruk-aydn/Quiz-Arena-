import { ApiError } from '../utils/ApiError.js';

describe('ApiError', () => {
  it('should create an ApiError with correct properties', () => {
    const err = new ApiError(400, 'BAD_REQUEST', 'Geçersiz istek');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.message).toBe('Geçersiz istek');
    expect(err.details).toBeUndefined();
  });

  it('should create an ApiError with details', () => {
    const err = new ApiError(422, 'VALIDATION', 'Hata', { field: 'email' });
    expect(err.details).toEqual({ field: 'email' });
  });

  it('should be an instance of Error', () => {
    const err = ApiError.badRequest('Test');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });

  it('should create badRequest error with 400 status', () => {
    const err = ApiError.badRequest('Hata');
    expect(err.statusCode).toBe(400);
  });

  it('should create badRequest error with details', () => {
    const err = ApiError.badRequest('Hata', 'BAD_REQUEST', { field: 'name' });
    expect(err.details).toEqual({ field: 'name' });
  });

  it('should create unauthorized error with 401 status', () => {
    const err = ApiError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Yetkisiz erişim');
  });

  it('should create forbidden error with 403 status', () => {
    const err = ApiError.forbidden();
    expect(err.statusCode).toBe(403);
  });

  it('should create notFound error with 404 status', () => {
    const err = ApiError.notFound();
    expect(err.statusCode).toBe(404);
  });

  it('should create conflict error with 409 status', () => {
    const err = ApiError.conflict('Çakışma');
    expect(err.statusCode).toBe(409);
  });

  it('should create tooMany error with 429 status', () => {
    const err = ApiError.tooMany();
    expect(err.statusCode).toBe(429);
  });

  it('should create internal error with 500 status', () => {
    const err = ApiError.internal();
    expect(err.statusCode).toBe(500);
  });
});
