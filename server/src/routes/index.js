import { Router } from 'express';
import authRoutes from './authRoutes.js';
import bookRoutes from './bookRoutes.js';
import profileRoutes from './profileRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/profile', profileRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

export default router;