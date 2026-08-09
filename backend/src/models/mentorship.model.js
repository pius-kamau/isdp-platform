const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MentorshipModel {
  // Create a mentorship request
  async createRequest(data) {
    return await prisma.mentorRequest.create({
      data: {
        menteeId: data.menteeId,
        mentorId: data.mentorId,
        skillId: data.skillId,
        message: data.message,
        status: 'pending',
      },
      include: {
        mentee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            county: true,
          },
        },
        mentor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            county: true,
          },
        },
        skill: true,
      },
    });
  }

  // Get mentorship request by ID
  async findRequestById(id) {
    return await prisma.mentorRequest.findUnique({
      where: { id },
      include: {
        mentee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            county: true,
          },
        },
        mentor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            county: true,
          },
        },
        skill: true,
        sessions: true,
      },
    });
  }

  // Get all requests for a user (as mentee)
  async getMenteeRequests(userId) {
    return await prisma.mentorRequest.findMany({
      where: { menteeId: userId },
      include: {
        mentor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            county: true,
          },
        },
        skill: true,
        sessions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get all requests for a user (as mentor)
  async getMentorRequests(userId) {
    return await prisma.mentorRequest.findMany({
      where: { mentorId: userId },
      include: {
        mentee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            county: true,
          },
        },
        skill: true,
        sessions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Update request status
  async updateRequestStatus(id, status) {
    return await prisma.mentorRequest.update({
      where: { id },
      data: {
        status,
        respondedAt: new Date(),
      },
      include: {
        mentee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
        mentor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
        skill: true,
      },
    });
  }

  // Create a mentorship session
  async createSession(data) {
    return await prisma.mentorSession.create({
      data: {
        requestId: data.requestId,
        mentorId: data.mentorId,
        menteeId: data.menteeId,
        scheduledAt: new Date(data.scheduledAt),
        durationMinutes: data.durationMinutes || 60,
        locationType: data.locationType || 'virtual',
        locationDetail: data.locationDetail,
        notes: data.notes,
      },
      include: {
        request: true,
        mentor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
        mentee: {
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

  // Get sessions for a user
  async getUserSessions(userId) {
    return await prisma.mentorSession.findMany({
      where: {
        OR: [
          { mentorId: userId },
          { menteeId: userId },
        ],
      },
      include: {
        request: true,
        mentor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
        mentee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  // Update session status
  async updateSessionStatus(id, status) {
    return await prisma.mentorSession.update({
      where: { id },
      data: { status },
      include: {
        request: true,
        mentor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
          },
        },
        mentee: {
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

  // Delete mentorship request
  async deleteRequest(id) {
    // First delete any sessions
    await prisma.mentorSession.deleteMany({
      where: { requestId: id },
    });
    
    return await prisma.mentorRequest.delete({
      where: { id },
    });
  }

  // Check if user is already in a pending request
  async checkPendingRequest(menteeId, mentorId, skillId) {
    return await prisma.mentorRequest.findFirst({
      where: {
        menteeId,
        mentorId,
        skillId,
        status: 'pending',
      },
    });
  }
}

module.exports = new MentorshipModel();