const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MessageModel {
  // Send a new message
  async sendMessage(data) {
    return await prisma.message.create({
      data: {
        senderId: data.senderId,
        receiverId: data.receiverId,
        messageText: data.messageText,
        attachmentUrl: data.attachmentUrl || [],
        parentId: data.parentId || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });
  }

  // Get conversation between two users
  async getConversation(userId1, userId2, limit = 50, offset = 0) {
    return await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  // Get all conversations for a user (list of users they've chatted with)
  async getUserConversations(userId) {
    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get unique conversation partners
    const conversations = [];
    const seenUsers = new Set();

    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      
      if (!seenUsers.has(partnerId)) {
        seenUsers.add(partnerId);
        const partner = msg.senderId === userId ? msg.receiver : msg.sender;
        
        // Get unread count for this conversation
        const unreadCount = await prisma.message.count({
          where: {
            senderId: partnerId,
            receiverId: userId,
            isRead: false,
          },
        });

        conversations.push({
          user: partner,
          lastMessage: msg,
          unreadCount,
        });
      }
    }

    return conversations;
  }

  // Mark messages as read
  async markAsRead(senderId, receiverId) {
    return await prisma.message.updateMany({
      where: {
        senderId: senderId,
        receiverId: receiverId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // Get unread message count for a user
  async getUnreadCount(userId) {
    return await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  // Delete a message (soft delete - just hide it)
  async deleteMessage(id, userId) {
    // Check if user is the sender
    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message || message.senderId !== userId) {
      return null;
    }

    return await prisma.message.delete({
      where: { id },
    });
  }

  // Get message by ID
  async findById(id) {
    return await prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });
  }
}

module.exports = new MessageModel();