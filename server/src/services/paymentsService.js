import prisma from '../config/prisma.js';
import { notificationService } from './notificationService.js';

export const paymentService = {
  // Create payment (from fineService, tapi dipindah ke sini)
  async createPayment(fineId, userId, amount, paymentMethod = 'cash', notes = null, isAdmin = false) {
    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
      include: {
        loan: {
          include: {
            copy: {
              include: { book: true },
            },
          },
        },
      },
    });
    
    if (!fine) {
      throw new Error('Fine not found');
    }
    
    // Check authorization
    if (!isAdmin && fine.userId !== userId) {
      throw new Error('Unauthorized');
    }
    
    if (fine.status === 'paid') {
      throw new Error('Fine already paid');
    }
    
    if (fine.status === 'waived') {
      throw new Error('Fine has been waived');
    }
    
    const remainingAmount = fine.amountTotal - fine.amountPaid;
    
    if (amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }
    
    if (amount > remainingAmount) {
      throw new Error(`Payment amount exceeds remaining fine (Rp ${remainingAmount})`);
    }
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        fineId,
        amount,
        paymentMethod,
        notes,
      },
    });
    
    // Update fine
    const newAmountPaid = fine.amountPaid + amount;
    const newStatus = newAmountPaid >= fine.amountTotal ? 'paid' : 'partial';
    
    await prisma.fine.update({
      where: { id: fineId },
      data: {
        amountPaid: newAmountPaid,
        status: newStatus,
      },
    });
    
    // Send notification
    await notificationService.sendPaymentConfirmation(payment.id);
    
    return {
      payment,
      remainingAmount: fine.amountTotal - newAmountPaid,
      status: newStatus,
      message: newStatus === 'paid' ? 'Fine fully paid' : `Partial payment received. Remaining: Rp ${fine.amountTotal - newAmountPaid}`,
    };
  },
  
  // Get payment by ID
  async getPaymentById(paymentId, userId, isAdmin = false) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        fine: {
          include: {
            loan: {
              include: {
                copy: {
                  include: { book: true },
                },
                user: {
                  include: { profile: true },
                },
              },
            },
          },
        },
      },
    });
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    // Check authorization
    if (!isAdmin && payment.fine.userId !== userId) {
      throw new Error('Unauthorized');
    }
    
    return payment;
  },
  
  // Get user's payment history
  async getUserPayments(userId) {
    const payments = await prisma.payment.findMany({
      where: {
        fine: { userId },
      },
      include: {
        fine: {
          include: {
            loan: {
              include: {
                copy: {
                  include: { book: true },
                },
              },
            },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });
    
    return payments;
  },
  
  // ==================== ADMIN ====================
  
  // Get all payments
  async getAllPayments(filters = {}, pagination = {}) {
    const { paymentMethod, fineId, userId, startDate, endDate } = filters;
    const { page = 1, limit = 20 } = pagination;
    
    const skip = (page - 1) * limit;
    const where = {};
    
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }
    
    if (fineId) {
      where.fineId = parseInt(fineId);
    }
    
    if (userId) {
      where.fine = { userId: parseInt(userId) };
    }
    
    if (startDate || endDate) {
      where.paidAt = {};
      if (startDate) where.paidAt.gte = new Date(startDate);
      if (endDate) where.paidAt.lte = new Date(endDate);
    }
    
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          fine: {
            include: {
              loan: {
                include: {
                  copy: {
                    include: { book: true },
                  },
                  user: {
                    include: { profile: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { paidAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);
    
    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  
  // Get payment statistics
  async getPaymentStatistics(startDate = null, endDate = null) {
    const where = {};
    
    if (startDate || endDate) {
      where.paidAt = {};
      if (startDate) where.paidAt.gte = new Date(startDate);
      if (endDate) where.paidAt.lte = new Date(endDate);
    }
    
    const [totalRevenue, paymentsByMethod, recentPayments] = await Promise.all([
      prisma.payment.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.findMany({
        where,
        take: 10,
        orderBy: { paidAt: 'desc' },
        include: {
          fine: {
            include: {
              loan: {
                include: {
                  copy: {
                    include: { book: true },
                  },
                  user: {
                    include: { profile: true },
                  },
                },
              },
            },
          },
        },
      }),
    ]);
    
    return {
      total: {
        count: totalRevenue._count,
        amount: totalRevenue._sum.amount || 0,
      },
      byMethod: paymentsByMethod.map(method => ({
        method: method.paymentMethod,
        count: method._count,
        amount: method._sum.amount || 0,
      })),
      recentPayments,
    };
  },
};