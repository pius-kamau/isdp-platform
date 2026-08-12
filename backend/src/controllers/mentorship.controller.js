const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mentorshipController = {
  // ============ MENTORSHIP REQUESTS ============

  // Create a mentorship request
  async createRequest(req, res) {
    try {
      const { mentorId, skillId, message } = req.body;
      const menteeId = req.userId;

      console.log('=== CREATE MENTORSHIP REQUEST ===');
      console.log('Mentee:', menteeId);
      console.log('Mentor:', mentorId);
      console.log('Skill:', skillId);

      if (!mentorId || !skillId) {
        return res.status(400).json({
          status: 'error',
          message: 'Mentor and skill are required'
        });
      }

      // Check if user is trying to request themselves
      if (menteeId === mentorId) {
        return res.status(400).json({
          status: 'error',
          message: 'You cannot request mentorship from yourself'
        });
      }

      // Check if mentor exists and is a mentor
      const mentor = await prisma.user.findFirst({
        where: {
          id: mentorId,
          isMentor: true,
          isActive: true,
          deletedAt: null
        }
      });

      if (!mentor) {
        return res.status(404).json({
          status: 'error',
          message: 'Mentor not found or not available'
        });
      }

      // Check if skill exists
      const skill = await prisma.skill.findUnique({
        where: { id: skillId }
      });

      if (!skill) {
        return res.status(404).json({
          status: 'error',
          message: 'Skill not found'
        });
      }

      // Check if request already exists (pending)
      const existingRequest = await prisma.mentorRequest.findFirst({
        where: {
          menteeId,
          mentorId,
          skillId,
          status: 'pending'
        }
      });

      if (existingRequest) {
        return res.status(400).json({
          status: 'error',
          message: 'You already have a pending request with this mentor for this skill'
        });
      }

      // Create the request
      const request = await prisma.mentorRequest.create({
        data: {
          menteeId,
          mentorId,
          skillId,
          message: message || '',
          status: 'pending'
        },
        include: {
          mentee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true
            }
          },
          mentor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true
            }
          },
          skill: true
        }
      });

      console.log('✅ Mentorship request created:', request.id);

      res.status(201).json({
        status: 'success',
        message: 'Mentorship request sent successfully',
        data: request
      });
    } catch (error) {
      console.error('Create request error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to create mentorship request'
      });
    }
  },

  // Get all mentorship requests for a user (as mentor or mentee)
  async getRequests(req, res) {
    try {
      const userId = req.userId;
      const { role, status } = req.query;

      console.log('=== GET MENTORSHIP REQUESTS ===');
      console.log('User:', userId);
      console.log('Role:', role);
      console.log('Status:', status);

      const where = {};

      if (role === 'mentor') {
        where.mentorId = userId;
      } else if (role === 'mentee') {
        where.menteeId = userId;
      } else {
        // Get both as mentor and mentee
        where.OR = [
          { mentorId: userId },
          { menteeId: userId }
        ];
      }

      if (status) {
        where.status = status;
      }

      const requests = await prisma.mentorRequest.findMany({
        where,
        include: {
          mentee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true,
              occupation: true
            }
          },
          mentor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true,
              occupation: true
            }
          },
          skill: true,
          sessions: {
            where: {
              status: { not: 'cancelled' }
            },
            select: {
              id: true,
              scheduledAt: true,
              status: true,
              durationMinutes: true
            }
          }
        },
        orderBy: {
          requestedAt: 'desc'
        }
      });

      res.json({
        status: 'success',
        data: requests
      });
    } catch (error) {
      console.error('Get requests error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to get mentorship requests'
      });
    }
  },

  // Update request status (accept/reject/cancel)
  async updateRequest(req, res) {
    try {
      const { id } = req.params;
      const { status, message } = req.body;
      const userId = req.userId;

      console.log('=== UPDATE MENTORSHIP REQUEST ===');
      console.log('Request ID:', id);
      console.log('Status:', status);
      console.log('User:', userId);

      if (!status) {
        return res.status(400).json({
          status: 'error',
          message: 'Status is required'
        });
      }

      const validStatuses = ['pending', 'accepted', 'rejected', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      // Get the request
      const request = await prisma.mentorRequest.findUnique({
        where: { id },
        include: {
          mentor: {
            select: { id: true, fullName: true }
          },
          mentee: {
            select: { id: true, fullName: true }
          },
          skill: true
        }
      });

      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Request not found'
        });
      }

      // Check authorization
      const isMentor = request.mentorId === userId;
      const isMentee = request.menteeId === userId;

      // Only mentor can accept/reject, mentee can cancel
      if (status === 'accepted' || status === 'rejected') {
        if (!isMentor) {
          return res.status(403).json({
            status: 'error',
            message: 'Only the mentor can accept or reject this request'
          });
        }
      }

      if (status === 'cancelled') {
        if (!isMentee && !isMentor) {
          return res.status(403).json({
            status: 'error',
            message: 'You are not authorized to cancel this request'
          });
        }
      }

      // Update the request
      const updatedRequest = await prisma.mentorRequest.update({
        where: { id },
        data: {
          status,
          respondedAt: status === 'accepted' || status === 'rejected' ? new Date() : undefined,
          message: message || request.message
        },
        include: {
          mentee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true
            }
          },
          mentor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true
            }
          },
          skill: true
        }
      });

      console.log('✅ Request updated:', id, '->', status);

      res.json({
        status: 'success',
        message: `Request ${status}`,
        data: updatedRequest
      });
    } catch (error) {
      console.error('Update request error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to update request'
      });
    }
  },

  // ============ MENTORSHIP SESSIONS ============

  // Create a session for a mentorship request
  async createSession(req, res) {
    try {
      const { requestId, scheduledAt, durationMinutes, locationType, locationDetail, notes } = req.body;
      const userId = req.userId;

      console.log('=== CREATE MENTORSHIP SESSION ===');
      console.log('Request ID:', requestId);
      console.log('Scheduled At:', scheduledAt);
      console.log('User:', userId);

      if (!requestId || !scheduledAt) {
        return res.status(400).json({
          status: 'error',
          message: 'Request ID and scheduled time are required'
        });
      }

      // Get the request
      const request = await prisma.mentorRequest.findUnique({
        where: { id: requestId },
        include: {
          mentor: true,
          mentee: true
        }
      });

      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Request not found'
        });
      }

      // Check if user is mentor or mentee
      if (request.mentorId !== userId && request.menteeId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to create a session for this request'
        });
      }

      // Check if request is accepted
      if (request.status !== 'accepted') {
        return res.status(400).json({
          status: 'error',
          message: 'Sessions can only be created for accepted requests'
        });
      }

      // Create the session
      const session = await prisma.mentorSession.create({
        data: {
          requestId,
          mentorId: request.mentorId,
          menteeId: request.menteeId,
          scheduledAt: new Date(scheduledAt),
          durationMinutes: durationMinutes || 60,
          locationType: locationType || 'virtual',
          locationDetail: locationDetail || '',
          notes: notes || '',
          status: 'scheduled'
        },
        include: {
          request: {
            include: {
              skill: true
            }
          },
          mentor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true
            }
          },
          mentee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true
            }
          }
        }
      });

      console.log('✅ Session created:', session.id);

      res.status(201).json({
        status: 'success',
        message: 'Session created successfully',
        data: session
      });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to create session'
      });
    }
  },

  // Get all sessions for a user
  async getSessions(req, res) {
    try {
      const userId = req.userId;
      const { role, status } = req.query;

      console.log('=== GET MENTORSHIP SESSIONS ===');
      console.log('User:', userId);
      console.log('Role:', role);
      console.log('Status:', status);

      const where = {};

      if (role === 'mentor') {
        where.mentorId = userId;
      } else if (role === 'mentee') {
        where.menteeId = userId;
      } else {
        where.OR = [
          { mentorId: userId },
          { menteeId: userId }
        ];
      }

      if (status) {
        where.status = status;
      }

      const sessions = await prisma.mentorSession.findMany({
        where,
        include: {
          request: {
            include: {
              skill: true
            }
          },
          mentor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true,
              occupation: true
            }
          },
          mentee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true,
              occupation: true
            }
          }
        },
        orderBy: {
          scheduledAt: 'asc'
        }
      });

      res.json({
        status: 'success',
        data: sessions
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to get sessions'
      });
    }
  },

  // Update session status
  async updateSession(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const userId = req.userId;

      console.log('=== UPDATE MENTORSHIP SESSION ===');
      console.log('Session ID:', id);
      console.log('Status:', status);
      console.log('User:', userId);

      if (!status) {
        return res.status(400).json({
          status: 'error',
          message: 'Status is required'
        });
      }

      const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      const session = await prisma.mentorSession.findUnique({
        where: { id }
      });

      if (!session) {
        return res.status(404).json({
          status: 'error',
          message: 'Session not found'
        });
      }

      // Check authorization
      if (session.mentorId !== userId && session.menteeId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to update this session'
        });
      }

      const updateData = { status };
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      if (status === 'completed') {
        updateData.attended = true;
      }

      const updatedSession = await prisma.mentorSession.update({
        where: { id },
        data: updateData,
        include: {
          request: {
            include: {
              skill: true
            }
          },
          mentor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true
            }
          },
          mentee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true
            }
          }
        }
      });

      console.log('✅ Session updated:', id, '->', status);

      res.json({
        status: 'success',
        message: `Session ${status}`,
        data: updatedSession
      });
    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to update session'
      });
    }
  },

  // ============ MENTORSHIP SEARCH ============

  // Search for mentors by skill or name
  async searchMentors(req, res) {
    try {
      const { query, skill, limit = 20 } = req.query;
      const userId = req.userId;

      console.log('=== SEARCH MENTORS ===');
      console.log('Query:', query);
      console.log('Skill:', skill);

      const where = {
        isMentor: true,
        isActive: true,
        deletedAt: null,
        id: { not: userId } // Exclude self
      };

      if (query) {
        where.OR = [
          { fullName: { contains: query, mode: 'insensitive' } },
          { occupation: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } }
        ];
      }

      // Filter by skill
      if (skill) {
        where.skills = {
          some: {
            skill: {
              name: { contains: skill, mode: 'insensitive' }
            },
            isMentor: true
          }
        };
      }

      const mentors = await prisma.user.findMany({
        where,
        include: {
          skills: {
            where: {
              isMentor: true
            },
            include: {
              skill: true
            }
          },
          qualifications: true,
          experience: true,
          availability: true
        },
        take: parseInt(limit),
        orderBy: {
          fullName: 'asc'
        }
      });

      // Add skill count and rating
      const formattedMentors = mentors.map(mentor => ({
        ...mentor,
        mentorSkills: mentor.skills.filter(s => s.isMentor),
        totalMentorSkills: mentor.skills.filter(s => s.isMentor).length
      }));

      res.json({
        status: 'success',
        data: formattedMentors
      });
    } catch (error) {
      console.error('Search mentors error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to search mentors'
      });
    }
  },

  // Get mentorship stats for a user
  async getStats(req, res) {
    try {
      const userId = req.userId;

      console.log('=== GET MENTORSHIP STATS ===');
      console.log('User:', userId);

      // As mentor
      const mentorRequests = await prisma.mentorRequest.count({
        where: { mentorId: userId }
      });

      const mentorPending = await prisma.mentorRequest.count({
        where: { mentorId: userId, status: 'pending' }
      });

      const mentorAccepted = await prisma.mentorRequest.count({
        where: { mentorId: userId, status: 'accepted' }
      });

      const mentorCompleted = await prisma.mentorRequest.count({
        where: { mentorId: userId, status: 'completed' }
      });

      // As mentee
      const menteeRequests = await prisma.mentorRequest.count({
        where: { menteeId: userId }
      });

      const menteePending = await prisma.mentorRequest.count({
        where: { menteeId: userId, status: 'pending' }
      });

      const menteeAccepted = await prisma.mentorRequest.count({
        where: { menteeId: userId, status: 'accepted' }
      });

      const menteeCompleted = await prisma.mentorRequest.count({
        where: { menteeId: userId, status: 'completed' }
      });

      // Sessions stats
      const totalSessions = await prisma.mentorSession.count({
        where: {
          OR: [
            { mentorId: userId },
            { menteeId: userId }
          ]
        }
      });

      const upcomingSessions = await prisma.mentorSession.count({
        where: {
          OR: [
            { mentorId: userId },
            { menteeId: userId }
          ],
          scheduledAt: { gt: new Date() },
          status: 'scheduled'
        }
      });

      res.json({
        status: 'success',
        data: {
          asMentor: {
            total: mentorRequests,
            pending: mentorPending,
            accepted: mentorAccepted,
            completed: mentorCompleted
          },
          asMentee: {
            total: menteeRequests,
            pending: menteePending,
            accepted: menteeAccepted,
            completed: menteeCompleted
          },
          sessions: {
            total: totalSessions,
            upcoming: upcomingSessions
          }
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to get mentorship stats'
      });
    }
  }
};

module.exports = mentorshipController;
