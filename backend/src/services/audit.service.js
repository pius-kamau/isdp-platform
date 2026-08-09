const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../config/logger');

class AuditService {
  // Log an action
  async log(userId, action, details = {}, req = null) {
    try {
      const data = {
        userId: userId || null,
        action,
        details,
        ipAddress: req?.ip || req?.connection?.remoteAddress || null,
        userAgent: req?.headers?.['user-agent'] || null,
      };

      const log = await prisma.activityLog.create({
        data,
      });

      logger.debug(`📝 Audit log: ${action} by user ${userId || 'system'}`);
      return log;
    } catch (error) {
      logger.error('Failed to create audit log:', error.message);
      return null;
    }
  }

  // Get audit logs for a user
  async getUserLogs(userId, limit = 50) {
    return await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Get audit logs with filters
  async getLogs(filters = {}, limit = 100) {
    const where = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = { contains: filters.action };
    if (filters.fromDate) where.createdAt = { gte: new Date(filters.fromDate) };
    if (filters.toDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.toDate),
      };
    }

    return await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  // Common audit actions
  async logUserRegistration(userId, req) {
    return this.log(userId, 'USER_REGISTERED', { type: 'registration' }, req);
  }

  async logUserLogin(userId, req) {
    return this.log(userId, 'USER_LOGGED_IN', { type: 'login' }, req);
  }

  async logUserLogout(userId, req) {
    return this.log(userId, 'USER_LOGGED_OUT', { type: 'logout' }, req);
  }

  async logUserUpdate(userId, changes, req) {
    return this.log(userId, 'USER_UPDATED', { changes }, req);
  }

  async logUserDelete(adminId, deletedUserId, req) {
    return this.log(adminId, 'USER_DELETED', { deletedUserId }, req);
  }

  async logMentorshipRequest(menteeId, mentorId, skillId, req) {
    return this.log(menteeId, 'MENTORSHIP_REQUESTED', { mentorId, skillId }, req);
  }

  async logMentorshipAccept(mentorId, menteeId, requestId, req) {
    return this.log(mentorId, 'MENTORSHIP_ACCEPTED', { menteeId, requestId }, req);
  }

  async logMentorshipReject(mentorId, menteeId, requestId, req) {
    return this.log(mentorId, 'MENTORSHIP_REJECTED', { menteeId, requestId }, req);
  }

  async logSkillAdded(userId, skillId, req) {
    return this.log(userId, 'SKILL_ADDED', { skillId }, req);
  }

  async logSkillRemoved(userId, skillId, req) {
    return this.log(userId, 'SKILL_REMOVED', { skillId }, req);
  }

  async logMessageSent(senderId, receiverId, req) {
    return this.log(senderId, 'MESSAGE_SENT', { receiverId }, req);
  }

  async logPasswordChanged(userId, req) {
    return this.log(userId, 'PASSWORD_CHANGED', { type: 'security' }, req);
  }

  async logEmailVerified(userId, req) {
    return this.log(userId, 'EMAIL_VERIFIED', { type: 'verification' }, req);
  }

  async logAdminAction(adminId, action, details, req) {
    return this.log(adminId, `ADMIN_${action.toUpperCase()}`, details, req);
  }
}

module.exports = new AuditService();