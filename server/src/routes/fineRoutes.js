import { Router } from 'express';
import { fineController } from '../controllers/fineController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ==================== USER ROUTES ====================
router.get('/my-fines', fineController.getMyFines);
router.get('/payment-history', fineController.getPaymentHistory);
router.get('/:id', fineController.getFineById);
router.post('/:id/pay', fineController.payFine);

// ==================== ADMIN ROUTES ====================
router.get('/', authorize('admin'), fineController.getAllFines);
router.post('/calculate/:loanId', authorize('admin'), fineController.calculateFine);
router.post('/', authorize('admin'), fineController.createFine);
router.post('/:id/waive', authorize('admin'), fineController.waiveFine);
router.put('/:id', authorize('admin'), fineController.updateFine);
router.get('/statistics/summary', authorize('admin'), fineController.getFineStatistics);

export default router;