import { Router } from 'express';
import * as quizController from '../controllers/quiz.controller.js';
import { authenticate, authenticateOptional } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { upload } from '../middlewares/upload.js';
import {
  addQuestionSchema,
  createQuizSchema,
  reorderQuestionsSchema,
  updateQuestionSchema,
  updateQuizSchema,
} from '../validators/quiz.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', quizController.listQuizzes);
router.get('/public', authenticateOptional, quizController.listPublicQuizzes);
router.get('/:id', quizController.getQuiz);
router.post('/', authenticate, validate(createQuizSchema), quizController.createQuiz);
router.put('/:id', validate(updateQuizSchema), quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);
router.post('/:id/duplicate', quizController.duplicateQuiz);

router.post('/:id/questions', validate(addQuestionSchema), quizController.addQuestion);
router.put('/:id/questions/:qId', validate(updateQuestionSchema), quizController.updateQuestion);
router.delete('/:id/questions/:qId', quizController.deleteQuestion);
router.patch(
  '/:id/questions/reorder',
  validate(reorderQuestionsSchema),
  quizController.reorderQuestions,
);
router.post('/:id/cover', upload.single('cover'), quizController.uploadCover);
router.post(
  '/:id/questions/:qId/image',
  upload.single('image'),
  quizController.uploadQuestionImage,
);

export default router;
