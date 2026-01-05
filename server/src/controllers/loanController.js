import { loanService } from '../services/loanService.js';

export const loanController = {
  // ==================== USER ====================
  
  // POST /api/loans/borrow
  async borrowBook(req, res, next) {
    try {
      const userId = req.user.userId;
      const { copyId } = req.body;
      
      if (!copyId) {
        return res.status(400).json({
          success: false,
          message: 'Copy ID is required',
        });
      }
      
      const loan = await loanService.borrowBook(userId, parseInt(copyId));
      
      res.status(201).json({
        success: true,
        message: 'Book borrowed successfully',
        data: loan,
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('not available') || error.message.includes('already borrowed') || error.message.includes('unpaid fines') || error.message.includes('more than 3')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // POST /api/loans/:id/return
  async returnBook(req, res, next) {
    try {
      const userId = req.user.userId;
      const loanId = parseInt(req.params.id);
      const isAdmin = req.user.role === 'admin';
      
      const result = await loanService.returnBook(loanId, userId, isAdmin);
      
      res.json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      if (error.message === 'Loan not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Unauthorized') || error.message.includes('already returned')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // GET /api/loans/my-loans
  async getMyLoans(req, res, next) {
    try {
      const userId = req.user.userId;
      const { status } = req.query;
      
      const loans = await loanService.getMyLoans(userId, status);
      
      res.json({
        success: true,
        data: loans,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // GET /api/loans/:id
  async getLoanById(req, res, next) {
    try {
      const userId = req.user.userId;
      const loanId = parseInt(req.params.id);
      const isAdmin = req.user.role === 'admin';
      
      const loan = await loanService.getLoanById(loanId, userId, isAdmin);
      
      res.json({
        success: true,
        data: loan,
      });
    } catch (error) {
      if (error.message === 'Loan not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // POST /api/loans/:id/renew
  async renewLoan(req, res, next) {
    try {
      const userId = req.user.userId;
      const loanId = parseInt(req.params.id);
      const isAdmin = req.user.role === 'admin';
      
      const loan = await loanService.renewLoan(loanId, userId, isAdmin);
      
      res.json({
        success: true,
        message: 'Loan renewed successfully',
        data: loan,
      });
    } catch (error) {
      if (error.message === 'Loan not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Unauthorized') || error.message.includes('cannot') || error.message.includes('Cannot')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // ==================== ADMIN ====================
  
  // GET /api/loans
  async getAllLoans(req, res, next) {
    try {
      const { status, userId, overdue, page, limit } = req.query;
      
      const filters = { status, userId, overdue };
      const pagination = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      };
      
      const result = await loanService.getAllLoans(filters, pagination);
      
      res.json({
        success: true,
        data: result.loans,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // POST /api/loans/mark-overdue
  async markOverdueLoans(req, res, next) {
    try {
      const result = await loanService.markOverdueLoans();
      
      res.json({
        success: true,
        message: result.message,
        data: { count: result.count },
      });
    } catch (error) {
      next(error);
    }
  },
  
  // POST /api/loans/:id/mark-lost
  async markAsLost(req, res, next) {
    try {
      const loanId = parseInt(req.params.id);
      
      const result = await loanService.markAsLost(loanId);
      
      res.json({
        success: true,
        message: result.message,
        data: result.fine,
      });
    } catch (error) {
      if (error.message === 'Loan not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Cannot mark')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
};