import prisma from "../config/prisma.js";
import { emitNotification } from "../utils/socketManager.js";

export const notificationService = {
  // Create Notification
  async createNotification(userId, type, message) {
    const notifiaction = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata,
        isRead: false,
      },
    });

    emitNotification(userId, notifiaction);

    return notifiaction;
  },

  //get user notifications
  async getUserNotifications(userId, filters = {}) {
    const { isRead, type } = filters;
    const where = { userId };

    if (isRead !== undefined) {
      where.isRead = isRead === "true";
    }

    if (type) {
      where.type = type;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return notifications;
  },

  async getNotificationById(notificationId, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new Error("Access denied");
    }

    return notification;
  },

  //mark as read
  async markAsRead(notificationId, userId) {
    const notification = await prisma.notification.findMany({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new Error("Access denied");
    }
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updated;
  },

  // Delete notification
  async deleteNotification(notificationId, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: "Notification deleted" };
  },

  // Get unread count
  async getUnreadCount(userId) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  },

  // ==================== AUTO NOTIFICATIONS ====================
  async sendLoanReminder(loanId) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        copy: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!loan) return;

    await this.createNotification(
      loan.userId,
      "loan_reminder",
      "Book Due Tomorrow",
      `Your loan for "${
        loan.copy.book.title
      }" is due tomorrow (${loan.dueDate.toLocaleDateString()})`,
      { loanId, bookId: loan.copy.bookId }
    );
  },

  // Send overdue notification
  async sendOverdueNotification(loanId) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        copy: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!loan) return;

    await this.createNotification(
      loan.userId,
      "loan_overdue",
      "Book Overdue Notice",
      `Your loan for "${
        loan.copy.book.title
      }" is overdue since ${loan.dueDate.toLocaleDateString()}. Please return it as soon as possible to avoid further fines.`,
      { loanId, bookId: loan.copy.bookId }
    );
  },

  // Sendi fine notification
  async sendFineNotification(fineId) {
    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
      include: {
        loan: {
          include: {
            copy: {
              include: {
                book: true,
              },
            },
          },
        },
      },
    });

    if (!fine) return;

    await this.createNotification(
      fine.userId,
      "fine_added",
      "Fine Added",
      `A fine of Rp ${fine.amountTotal} has been added for "${fine.loan.copy.book.title}"`,
      { fineId, loanId: fine.loanId }
    );
  },

  //send reservation ready notification
  async sendReservationReady(reservationId) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { book: true },
    });
    
    if (!reservation) return;
    
    await this.createNotification(
      reservation.userId,
      'reservation_ready',
      'Reserved Book Available',
      `"${reservation.book.title}" is now available for pickup!`,
      { reservationId, bookId: reservation.bookId }
    );
  },

  // Send payment confirmation
  async sendPaymentConfirmation(paymentId) {
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
              },
            },
          },
        },
      },
    });
    
    if (!payment) return;
    
    await this.createNotification(
      payment.fine.userId,
      'payment_received',
      'Payment Received',
      `Payment of Rp ${payment.amount} received for fine on "${payment.fine.loan.copy.book.title}"`,
      { paymentId, fineId: payment.fineId }
    );
  },
};
