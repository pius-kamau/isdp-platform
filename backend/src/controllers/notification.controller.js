const notificationModel = require('../models/notification.model');

class NotificationController {
  // Get all notifications for current user
  async getMyNotifications(req, res) {
    try {
      const userId = req.userId;
      const { limit, offset } = req.query;

      const notifications = await notificationModel.getUserNotifications(
        userId,
        limit ? parseInt(limit) : 20,
        offset ? parseInt(offset) : 0
      );

      const unreadCount = await notificationModel.getUnreadCount(userId);

      res.json({
        status: 'success',
        data: notifications,
        unreadCount,
        pagination: {
          limit: limit ? parseInt(limit) : 20,
          offset: offset ? parseInt(offset) : 0,
        },
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch notifications',
      });
    }
  }

  // Get unread notification count
  async getUnreadCount(req, res) {
    try {
      const userId = req.userId;
      const count = await notificationModel.getUnreadCount(userId);

      res.json({
        status: 'success',
        data: { unreadCount: count },
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get unread count',
      });
    }
  }

  // Mark a notification as read
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const notification = await notificationModel.findById(id);
      if (!notification) {
        return res.status(404).json({
          status: 'error',
          message: 'Notification not found',
        });
      }

      // Check if notification belongs to user
      if (notification.userId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to access this notification',
        });
      }

      const updated = await notificationModel.markAsRead(id, userId);

      res.json({
        status: 'success',
        message: 'Notification marked as read',
        data: updated,
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark notification as read',
      });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const userId = req.userId;
      const result = await notificationModel.markAllAsRead(userId);

      res.json({
        status: 'success',
        message: 'All notifications marked as read',
        data: { count: result.count },
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark all notifications as read',
      });
    }
  }

  // Delete a notification
  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const notification = await notificationModel.findById(id);
      if (!notification) {
        return res.status(404).json({
          status: 'error',
          message: 'Notification not found',
        });
      }

      // Check if notification belongs to user
      if (notification.userId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to delete this notification',
        });
      }

      await notificationModel.delete(id, userId);

      res.json({
        status: 'success',
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete notification',
      });
    }
  }

  // Delete all notifications for current user
  async deleteAll(req, res) {
    try {
      const userId = req.userId;
      const result = await notificationModel.deleteAll(userId);

      res.json({
        status: 'success',
        message: 'All notifications deleted',
        data: { count: result.count },
      });
    } catch (error) {
      console.error('Delete all notifications error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete all notifications',
      });
    }
  }
}

module.exports = new NotificationController();