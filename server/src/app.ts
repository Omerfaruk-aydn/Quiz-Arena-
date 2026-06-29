import express, { type Application, type Request, type Response } from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { apiLimiter } from './api/middlewares/rateLimiter.js';
import authRoutes from './api/routes/auth.routes.js';
import quizRoutes from './api/routes/quiz.routes.js';
import gameRoutes from './api/routes/game.routes.js';
import userRoutes from './api/routes/user.routes.js';
import aiRoutes from './api/routes/ai.routes.js';
import { notFound, errorHandler } from './api/middlewares/errorHandler.js';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  morgan.token('body-len', (req: Request) =>
    String(req.body ? JSON.stringify(req.body).length : 0),
  );
  app.use(
    morgan(config.isDev ? 'dev' : 'combined', { stream: { write: (m) => logger.info(m.trim()) } }),
  );

  app.use('/api', apiLimiter);

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', uptime: process.uptime(), env: config.env });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/quizzes', quizRoutes);
  app.use('/api/games', gameRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/ai', aiRoutes);

  const clientDist = path.resolve(process.cwd(), '../client/dist');
  app.use(express.static(clientDist));

  app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api/')) return;
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
