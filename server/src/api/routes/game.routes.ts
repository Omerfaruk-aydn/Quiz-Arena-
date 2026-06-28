import { Router } from 'express';
import * as gameController from '../controllers/game.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { createGameSchema } from '../validators/game.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createGameSchema), gameController.createGame);
router.get('/history', gameController.listGameHistory);
router.get('/:pin', gameController.getGameByPin);
router.get('/:pin/report', gameController.getGameReport);

export default router;
