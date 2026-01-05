import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ==================== USER ROUTES ====================
router.post('/', paymentController.createPayment);
router.get('/my-payments', paymentController.getUserPayments);
router.get('/:id', paymentController.getPaymentById);

// ==================== ADMIN ROUTES ====================
router.get('/', authorize('admin'), paymentController.getAllPayments);
router.get('/statistics/summary', authorize('admin'), paymentController.getPaymentStatistics);

export default router;