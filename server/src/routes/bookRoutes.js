import { Router } from 'express';
import { bookController } from '../controllers/bookController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBookById);
router.get('/:id/available-copies', bookController.getAvailableCopies);

// Protected routes (Admin only)
router.post('/', authenticate, authorize('admin'), bookController.createBook);
router.put('/:id', authenticate, authorize('admin'), bookController.updateBook);
router.delete('/:id', authenticate, authorize('admin'), bookController.deleteBook);

//book copies management
router.post('/:id/copies', authenticate, authorize('admin'), bookController.addBookCopy);
router.get('/:id/copies', authenticate, authorize('admin'), bookController.getBookCopies);
router.put('/copies/:copyId', authenticate, authorize('admin'), bookController.updateBookCopy);
router.delete('/copies/:copyId', authenticate, authorize('admin'), bookController.deleteBookCopy);

export default router;