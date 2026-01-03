import { Router } from 'expresss';
import { profileController } from '../controllers/profileController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', authenticate, profileController.getProfile);
router.put('/', authenticate, profileController.updateProfile);
router.put('/avatar', authenticate, profileController.updateAvatar);
router.post('/change-password', authenticate, profileController.changePassword);

export default router;