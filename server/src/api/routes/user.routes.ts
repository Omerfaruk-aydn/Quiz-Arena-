import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema } from '../validators/auth.validator.js';

const router = Router();

router.use(authenticate);

router.get('/stats', userController.getStats);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

export default router;
