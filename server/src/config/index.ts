import { env } from './env.js';

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  isProd: env.NODE_ENV === 'production',
  isDev: env.NODE_ENV === 'development',
  clientUrl: env.CLIENT_URL,
  redis: {
    url: env.REDIS_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpires: env.JWT_ACCESS_EXPIRES,
    refreshExpires: env.JWT_REFRESH_EXPIRES,
  },
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.EMAIL_FROM,
  },
  openrouter: {
    apiKey: env.OPENROUTER_API_KEY,
  },
} as const;
