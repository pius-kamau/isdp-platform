const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NotificationModel {
  // Create a notification
  async create(data) {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link || null,
      },
    });
  }

  // Create multiple notifications at once
  async createMany(notifications) {
    return await prisma.notification.createMany({
      data: notifications,
    });
  }

  // Get notifications for a user
  async getUserNotifications(userId, limit = 20, offset = 0) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  // Get unread notifications count for a user
  async getUnreadCount(userId) {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  // Mark a notification as read
  async markAsRead(id, userId) {
    return await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // Delete a notification
  async delete(id, userId) {
    return await prisma.notification.delete({
      where: { id },
    });
  }

  // Delete all notifications for a user
  async deleteAll(userId) {
    return await prisma.notification.deleteMany({
      where: { userId },
    });
  }

  // Get notification by ID
  async findById(id) {
    return await prisma.notification.findUnique({
      where: { id },
    });
  }
}

module.exports = new NotificationModel();