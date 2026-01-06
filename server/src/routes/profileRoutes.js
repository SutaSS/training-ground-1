import { Router } from 'express';
import { profileController } from '../controllers/profileController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.put('/avatar', profileController.updateAvatar);
router.post('/change-password', profileController.changePassword);

export default router;