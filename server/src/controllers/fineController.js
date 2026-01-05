import { fineService } from '../services/fineService.js';

export const fineController = {
  // ==================== USER ====================
  
  // GET /api/fines/my-fines
  async getMyFines(req, res, next) {
    try {
      const userId = req.user.userId;
      const { status } = req.query;
      
      const fines = await fineService.getUserFines(userId, status);
      
      res.json({
        success: true,
        data: fines,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // GET /api/fines/:id
  async getFineById(req, res, next) {
    try {
      const userId = req.user.userId;
      const fineId = parseInt(req.params.id);
      const isAdmin = req.user.role === 'admin';
      
      const fine = await fineService.getFineById(fineId, userId, isAdmin);
      
      res.json({
        success: true,
        data: fine,
      });
    } catch (error) {
      if (error.message === 'Fine not found') {
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
  
  // POST /api/fines/:id/pay
  async payFine(req, res, next) {
    try {
      const userId = req.user.userId;
      const fineId = parseInt(req.params.id);
      const { amount, paymentMethod, notes } = req.body;
      const isAdmin = req.user.role === 'admin';
      
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid payment amount is required',
        });
      }
      
      const result = await fineService.payFine(fineId, userId, { amount, paymentMethod, notes }, isAdmin);
      
      res.json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      if (error.message === 'Fine not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Unauthorized') || error.message.includes('already paid') || error.message.includes('waived') || error.message.includes('exceeds')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // GET /api/fines/payment-history
  async getPaymentHistory(req, res, next) {
    try {
      const userId = req.user.userId;
      const isAdmin = req.user.role === 'admin';
      
      const payments = await fineService.getPaymentHistory(userId, isAdmin);
      
      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // ==================== ADMIN ====================
  
  // GET /api/fines
  async getAllFines(req, res, next) {
    try {
      const { status, userId, reason, page, limit } = req.query;
      
      const filters = { status, userId, reason };
      const pagination = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      };
      
      const result = await fineService.getAllFines(filters, pagination);
      
      res.json({
        success: true,
        data: result.fines,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // POST /api/fines/calculate/:loanId
  async calculateFine(req, res, next) {
    try {
      const loanId = parseInt(req.params.loanId);
      
      const result = await fineService.calculateFine(loanId);
      
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
      if (error.message.includes('Can only calculate')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // POST /api/fines
  async createFine(req, res, next) {
    try {
      const { loanId, amount, reason, notes } = req.body;
      
      if (!loanId || !amount || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Loan ID, amount, and reason are required',
        });
      }
      
      const fine = await fineService.createFine(parseInt(loanId), amount, reason, notes);
      
      res.status(201).json({
        success: true,
        message: 'Fine created successfully',
        data: fine,
      });
    } catch (error) {
      if (error.message === 'Loan not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('already exists') || error.message.includes('must be greater') || error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // POST /api/fines/:id/waive
  async waiveFine(req, res, next) {
    try {
      const fineId = parseInt(req.params.id);
      const { notes } = req.body;
      
      const fine = await fineService.waiveFine(fineId, notes);
      
      res.json({
        success: true,
        message: 'Fine waived successfully',
        data: fine,
      });
    } catch (error) {
      if (error.message === 'Fine not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Cannot waive') || error.message.includes('already')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // PUT /api/fines/:id
  async updateFine(req, res, next) {
    try {
      const fineId = parseInt(req.params.id);
      const { amountTotal, reason, notes } = req.body;
      
      const fine = await fineService.updateFine(fineId, { amountTotal, reason, notes });
      
      res.json({
        success: true,
        message: 'Fine updated successfully',
        data: fine,
      });
    } catch (error) {
      if (error.message === 'Fine not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Cannot update')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // GET /api/fines/statistics
  async getFineStatistics(req, res, next) {
    try {
      const stats = await fineService.getFineStatistics();
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};