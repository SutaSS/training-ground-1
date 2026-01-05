import prisma from '../config/prisma.js';

export const fineService = {
  // ==================== USER & ADMIN ====================
  
  // Get user's fines
  async getUserFines(userId, status = null) {
    const where = { userId };
    
    if (status) {
      where.status = status;
    }
    
    const fines = await prisma.fine.findMany({
      where,
      include: {
        loan: {
          include: {
            copy: {
              include: { book: true },
            },
          },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return fines;
  },
  
  // Get fine by ID
  async getFineById(fineId, userId, isAdmin = false) {
    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
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
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });
    
    if (!fine) {
      throw new Error('Fine not found');
    }
    
    // Check authorization
    if (!isAdmin && fine.userId !== userId) {
      throw new Error('Unauthorized to view this fine');
    }
    
    return fine;
  },
  
  // Pay fine
  async payFine(fineId, userId, paymentData, isAdmin = false) {
    const { amount, paymentMethod = 'cash', notes } = paymentData;
    
    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
      include: { payments: true },
    });
    
    if (!fine) {
      throw new Error('Fine not found');
    }
    
    // Check authorization
    if (!isAdmin && fine.userId !== userId) {
      throw new Error('Unauthorized to pay this fine');
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
    
    const updatedFine = await prisma.fine.update({
      where: { id: fineId },
      data: {
        amountPaid: newAmountPaid,
        status: newStatus,
      },
      include: {
        payments: true,
        loan: {
          include: {
            copy: {
              include: { book: true },
            },
          },
        },
      },
    });
    
    return {
      fine: updatedFine,
      payment,
      remainingAmount: updatedFine.amountTotal - updatedFine.amountPaid,
      message: newStatus === 'paid' ? 'Fine fully paid' : `Partial payment received. Remaining: Rp ${updatedFine.amountTotal - updatedFine.amountPaid}`,
    };
  },
  
  // Get payment history
  async getPaymentHistory(userId, isAdmin = false) {
    const where = isAdmin ? {} : { fine: { userId } };
    
    const payments = await prisma.payment.findMany({
      where,
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
    });
    
    return payments;
  },
  
  // ==================== ADMIN ONLY ====================
  
  // Get all fines with filters
  async getAllFines(filters = {}, pagination = {}) {
    const { status, userId, reason } = filters;
    const { page = 1, limit = 20 } = pagination;
    
    const skip = (page - 1) * limit;
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = parseInt(userId);
    }
    
    if (reason) {
      where.reason = reason;
    }
    
    const [fines, total] = await Promise.all([
      prisma.fine.findMany({
        where,
        skip,
        take: limit,
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
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fine.count({ where }),
    ]);
    
    return {
      fines,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  
  // Calculate fine manually (admin can override)
  async calculateFine(loanId) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        copy: {
          include: { book: true },
        },
        fine: true,
      },
    });
    
    if (!loan) {
      throw new Error('Loan not found');
    }
    
    if (loan.fine) {
      return {
        message: 'Fine already exists for this loan',
        fine: loan.fine,
      };
    }
    
    if (loan.status !== 'overdue' && loan.status !== 'returned') {
      throw new Error('Can only calculate fine for overdue or returned loans');
    }
    
    const dueDate = new Date(loan.dueDate);
    const checkDate = loan.returnDate || new Date();
    
    if (checkDate <= dueDate) {
      return {
        message: 'No fine needed - loan returned on time',
        fine: null,
      };
    }
    
    const daysLate = Math.ceil((checkDate - dueDate) / (1000 * 60 * 60 * 24));
    const fineAmount = daysLate * 1000; // Rp 1000 per day
    
    const fine = await prisma.fine.create({
      data: {
        loanId,
        userId: loan.userId,
        amountTotal: fineAmount,
        amountPaid: 0,
        status: 'unpaid',
        reason: 'late',
      },
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
    
    return {
      message: `Fine calculated: ${daysLate} days late`,
      fine,
    };
  },
  
  // Create fine manually (admin)
  async createFine(loanId, amount, reason, notes = null) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { fine: true },
    });
    
    if (!loan) {
      throw new Error('Loan not found');
    }
    
    if (loan.fine) {
      throw new Error('Fine already exists for this loan');
    }
    
    if (amount <= 0) {
      throw new Error('Fine amount must be greater than 0');
    }
    
    const validReasons = ['late', 'damage', 'lost', 'other'];
    if (!validReasons.includes(reason)) {
      throw new Error('Invalid fine reason');
    }
    
    const fine = await prisma.fine.create({
      data: {
        loanId,
        userId: loan.userId,
        amountTotal: amount,
        amountPaid: 0,
        status: 'unpaid',
        reason,
        notes,
      },
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
    
    return fine;
  },
  
  // Waive fine (admin forgives fine)
  async waiveFine(fineId, notes = null) {
    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
    });
    
    if (!fine) {
      throw new Error('Fine not found');
    }
    
    if (fine.status === 'paid') {
      throw new Error('Cannot waive already paid fine');
    }
    
    if (fine.status === 'waived') {
      throw new Error('Fine already waived');
    }
    
    const updatedFine = await prisma.fine.update({
      where: { id: fineId },
      data: {
        status: 'waived',
        notes: notes || fine.notes,
      },
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
    });
    
    return updatedFine;
  },
  
  // Update fine amount (admin can adjust)
  async updateFine(fineId, data) {
    const { amountTotal, reason, notes } = data;
    
    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
    });
    
    if (!fine) {
      throw new Error('Fine not found');
    }
    
    if (fine.status === 'paid') {
      throw new Error('Cannot update paid fine');
    }
    
    if (fine.status === 'waived') {
      throw new Error('Cannot update waived fine');
    }
    
    const updatedFine = await prisma.fine.update({
      where: { id: fineId },
      data: {
        amountTotal: amountTotal || fine.amountTotal,
        reason: reason || fine.reason,
        notes: notes !== undefined ? notes : fine.notes,
        status: fine.amountPaid >= (amountTotal || fine.amountTotal) ? 'paid' : fine.status,
      },
    });
    
    return updatedFine;
  },
  
  // Get fine statistics (admin dashboard)
  async getFineStatistics() {
    const [totalUnpaid, totalPaid, totalWaived, recentFines] = await Promise.all([
      prisma.fine.aggregate({
        where: { status: { in: ['unpaid', 'partial'] } },
        _sum: { amountTotal: true },
        _count: true,
      }),
      prisma.fine.aggregate({
        where: { status: 'paid' },
        _sum: { amountPaid: true },
        _count: true,
      }),
      prisma.fine.count({
        where: { status: 'waived' },
      }),
      prisma.fine.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
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
      }),
    ]);
    
    return {
      unpaid: {
        count: totalUnpaid._count,
        amount: totalUnpaid._sum.amountTotal || 0,
      },
      paid: {
        count: totalPaid._count,
        amount: totalPaid._sum.amountPaid || 0,
      },
      waived: {
        count: totalWaived,
      },
      recentFines,
    };
  },
};