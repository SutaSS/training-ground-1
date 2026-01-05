import { paymentService } from '../services/paymentService.js';

export const paymentController = {
  // POST /api/payments (create payment)
  async createPayment(req, res, next) {
    try {
      const userId = req.user.userId;
      const { fineId, amount, paymentMethod, notes } = req.body;
      const isAdmin = req.user.role === 'admin';
      
      if (!fineId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Fine ID and amount are required',
        });
      }
      
      const result = await paymentService.createPayment(
        parseInt(fineId),
        userId,
        amount,
        paymentMethod,
        notes,
        isAdmin
      );
      
      res.status(201).json({
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
      if (error.message.includes('Unauthorized') || error.message.includes('already paid') || error.message.includes('waived') || error.message.includes('exceeds') || error.message.includes('must be greater')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // GET /api/payments/my-payments
  async getUserPayments(req, res, next) {
    try {
      const userId = req.user.userId;
      
      const payments = await paymentService.getUserPayments(userId);
      
      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // GET /api/payments/:id
  async getPaymentById(req, res, next) {
    try {
      const userId = req.user.userId;
      const paymentId = parseInt(req.params.id);
      const isAdmin = req.user.role === 'admin';
      
      const payment = await paymentService.getPaymentById(paymentId, userId, isAdmin);
      
      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      if (error.message === 'Payment not found') {
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
  
  // ==================== ADMIN ====================
  
  // GET /api/payments
  async getAllPayments(req, res, next) {
    try {
      const { paymentMethod, fineId, userId, startDate, endDate, page, limit } = req.query;
      
      const filters = { paymentMethod, fineId, userId, startDate, endDate };
      const pagination = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      };
      
      const result = await paymentService.getAllPayments(filters, pagination);
      
      res.json({
        success: true,
        data: result.payments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // GET /api/payments/statistics
  async getPaymentStatistics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      const stats = await paymentService.getPaymentStatistics(startDate, endDate);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};