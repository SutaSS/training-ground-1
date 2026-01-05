import { Router } from 'express';
import authRoutes from './authRoutes.js';
import bookRoutes from './bookRoutes.js';
import profileRoutes from './profileRoutes.js';
import loanRoutes from './loanRoutes.js';
import fineRoutes from './fineRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/profile', profileRoutes);
router.use('/loans', loanRoutes);
router.use('/fines', userRoutes);
router.use('/fines', fineRoutes);
router.use('/notifications', notificationRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

export default router;