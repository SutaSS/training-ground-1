import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  // GET /api/notifications
  async getUserNotifications(req, res, next) {
    try {
      const userId = req.user.userId;
      const { isRead, type } = req.query;
      
      const notifications = await notificationService.getUserNotifications(userId, { isRead, type });
      
      res.json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // GET /api/notifications/unread-count
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.userId;
      
      const count = await notificationService.getUnreadCount(userId);
      
      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  },
  
  // GET /api/notifications/:id
  async getNotificationById(req, res, next) {
    try {
      const userId = req.user.userId;
      const notificationId = parseInt(req.params.id);
      
      const notification = await notificationService.getNotificationById(notificationId, userId);
      
      res.json({
        success: true,
        data: notification,
      });
    } catch (error) {
      if (error.message === 'Notification not found') {
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
  
  // PUT /api/notifications/:id/read
  async markAsRead(req, res, next) {
    try {
      const userId = req.user.userId;
      const notificationId = parseInt(req.params.id);
      
      const notification = await notificationService.markAsRead(notificationId, userId);
      
      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      if (error.message === 'Notification not found') {
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
  
  // PUT /api/notifications/mark-all-read
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.userId;
      
      const result = await notificationService.markAllAsRead(userId);
      
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // DELETE /api/notifications/:id
  async deleteNotification(req, res, next) {
    try {
      const userId = req.user.userId;
      const notificationId = parseInt(req.params.id);
      
      const result = await notificationService.deleteNotification(notificationId, userId);
      
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error.message === 'Notification not found') {
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
};