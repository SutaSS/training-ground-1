import { Router } from 'express';
import { loanController } from '../controllers/loanController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ==================== USER ROUTES ====================
router.post('/borrow', loanController.borrowBook);
router.post('/:id/return', loanController.returnBook);
router.get('/my-loans', loanController.getMyLoans);
router.get('/:id', loanController.getLoanById);
router.post('/:id/renew', loanController.renewLoan);

// ==================== ADMIN ROUTES ====================
router.get('/', authorize('admin'), loanController.getAllLoans);
router.post('/mark-overdue', authorize('admin'), loanController.markOverdueLoans);
router.post('/:id/mark-lost', authorize('admin'), loanController.markAsLost);

export default router;