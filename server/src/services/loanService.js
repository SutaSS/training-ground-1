import prisma from "../config/prisma.js";
import { emitLoanUpdate } from "../utils/socketManager.js";

export const loanService = {
  //======= User & Admin =======

  // Borrow book (user)
  async borrowBook(userId, copyId) {
    // Check if the book copy is available
    const copy = await prisma.bookCopy.findUnique({
      where: { id: copyId },
      include: {
        book: true,
        loans: {
          where: { status: { in: ["active", "overdue"] } },
        },
      },
    });

    if (!copy) {
      throw new Error("Book copy not found");
    }

    if (copy.status !== "available") {
      throw new Error("Book copy is not available for loan");
    }

    if (copy.loans.length > 0) {
      throw new Error("Book copy is currently on loan");
    }

    //check if user has unpaid fines
    const unpaidFines = await prisma.fine.findMany({
      where: {
        userId: userId,
        status: { not: "paid" },
      },
    });

    if (unpaidFines.length > 0) {
      throw new Error("Cannot borrow book. You have unpaid fines.");
    }

    const activeLoans = await prisma.loan.count({
      where: {
        userId,
        status: { in: ["active", "overdue"] },
      },
    });

    if (activeLoans >= 3) {
      throw new Error("Cannot borrow more than 3 books at a time.");
    }

    const loanDate = new Date();
    const dueDate = new Date();

    dueDate.setDate(loanDate.getDate() + 14); // 2 weeks loan period

    //create loan record
    const loan = await prisma.loan.create({
      data: {
        userId,
        copyId,
        status: "active",
        loanDate,
        dueDate,
      },
      include: {
        copy: {
          include: {
            book: true,
          },
        },
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    emitLoanUpdate(loan.userId, loan);

    return loan;
  },

  // Return book (user)
  async returnBook(loanId, userId, isAdmin = false) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        copy: {
          include: {
            book: true,
          },
        },
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!loan) {
      throw new Error("Loan record not found");
    }

    //check auth (user can only return their own loans, admin can retun any)
    if (!isAdmin && loan.userId !== userId) {
      throw new Error(" Unauthorized to return this loan");
    }

    if (loan.status === "returned") {
      throw new Error("Book has already been returned");
    }

    const returnDate = new Date();

    //check if overdue and calculate fine
    let fine = null;

    if (returnDate > loan.dueDate) {
      const daysLate = Math.ceil(
        (returnDate - loan.dueDate) / (1000 * 60 * 60 * 24)
      );
      const fineAmount = daysLate * 1000; // Rp.1000 per day late

      fine = await prisma.fine.create({
        data: {
          loanId: loan.id,
          userId: loan.userId,
          amaountTotal: fineAmount,
          amountPaid: 0,
          status: "unpaid",
          reason: `Late return by ${daysLate} days`,
        },
      });
    }

    //update loan record
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: "returned",
        returnDate,
      },
      include: {
        copy: {
          include: {
            book: true,
          },
        },
        fine: true,
      },
    });

    //update copy status to available
    await prisma.bookCopy.update({
      where: { id: loan.copyId },
      data: { status: "available" },
    });

    emitLoanUpdate({
      action: "returned",
      loanId: loan.id,
      userId: loan.userId,
      copyId: loan.copyId,
      bookTitle: loan.copy.book.title,
      fine: fine ? fine.amountTotal : 0,
    });

    return {
      loan: updatedLoan,
      fine: fine,
      message: fine
        ? `Book returned with a fine of Rp.${fine.amountTotal}`
        : "Book returned on time. No fines incurred.",
    };
  },

  async getMyLoans(userId, status = null) {
    const where = { userId };

    if (status) {
      where.status = status;
    }

    const loans = await prisma.loan.findmany({
      where,
      include: {
        copy: {
          include: { book: true },
        },
        fine: true,
      },
      oderBy: {
        loanDate: "desc",
      },
    });

    return loans;
  },

  async getLoanById(loanId, userId, isAdmin = false) {
    const loan = await prisma.loan.findUnique({
      where: {
        id: loanId,
      },
      include: {
        copy: {
          include: { book: true },
        },
      },
      user: {
        include: { profile: true },
      },
      fine: {
        include: { payments: true },
      },
    });

    if (!loan) {
      throw new Error("Loan record not found");
    }

    if (!isAdmin && loan.userId !== userId) {
      throw new Error("Unauthorized to view this loan");
    }

    return loan;
  },

  //======= admin only =======
  async getAllLoans(filters = {}, pagination = {}) {
    const { status, userId, overdue } = filters;
    const { page = 1, limit = 20 } = pagination;

    const skip = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = parseInt(userId);
    }

    if (overdue === "true") {
      where.dueDate = { lt: new Date() };
      where.status = { in: ["active", "overdue"] };
    }

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip,
        take: limit,
        include: {
          copy: {
            include: { book: true },
          },
          user: {
            include: { profile: true },
          },
          fine: true,
        },
        orderBy: { loanDate: "desc" },
      }),
      prisma.loan.count({ where }),
    ]);

    return {
      loans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Mark loans as overdue (cron job / admin action)
  async markOverdueLoans() {
    const now = new Date();

    const overdueLoans = await prisma.loan.updateMany({
      where: {
        status: "active",
        dueDate: { lt: now },
      },
      data: {
        status: "overdue",
      },
    });

    return {
      message: `${overdueLoans.count} loans marked as overdue`,
      count: overdueLoans.count,
    };
  },

  // Mark book as lost
  async markAsLost(loanId) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        copy: {
          include: { book: true },
        },
      },
    });

    if (!loan) {
      throw new Error("Loan not found");
    }

    if (loan.status === "returned") {
      throw new Error("Cannot mark returned loan as lost");
    }

    // Create fine for lost book (book price or fixed amount)
    const lostBookFine = 50000; // Rp 50,000

    const fine = await prisma.fine.create({
      data: {
        loanId: loan.id,
        userId: loan.userId,
        amountTotal: lostBookFine,
        amountPaid: 0,
        status: "unpaid",
        reason: "lost",
      },
    });

    // Update loan status
    await prisma.loan.update({
      where: { id: loanId },
      data: { status: "lost" },
    });

    // Update copy condition
    await prisma.bookCopy.update({
      where: { id: loan.copyId },
      data: {
        condition: "lost",
        status: "borrowed", // Keep as borrowed since it's lost
      },
    });

    return {
      message: "Loan marked as lost",
      fine,
    };
  },

  // Renew loan (extend due date)
  async renewLoan(loanId, userId, isAdmin = false) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { fine: true },
    });

    if (!loan) {
      throw new Error("Loan not found");
    }

    // Check authorization
    if (!isAdmin && loan.userId !== userId) {
      throw new Error("Unauthorized to renew this loan");
    }

    if (loan.status !== "active") {
      throw new Error("Only active loans can be renewed");
    }

    // Check if already overdue
    if (new Date() > loan.dueDate) {
      throw new Error(
        "Cannot renew overdue loan. Please return the book first."
      );
    }

    // Check if user has unpaid fines
    if (loan.fine && loan.fine.status !== "paid") {
      throw new Error("Cannot renew loan with unpaid fines");
    }

    // Extend due date by 7 days
    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 7);

    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: { dueDate: newDueDate },
      include: {
        copy: {
          include: { book: true },
        },
      },
    });

    return updatedLoan;
  },
};
