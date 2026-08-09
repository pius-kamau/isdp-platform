const mentorshipModel = require('../models/mentorship.model');

class MentorshipController {
  // Request a mentor
  async requestMentor(req, res) {
    try {
      const { mentorId, skillId, message } = req.body;
      const menteeId = req.userId;

      // Validate required fields
      if (!mentorId) {
        return res.status(400).json({
          status: 'error',
          message: 'Mentor ID is required',
        });
      }

      if (!skillId) {
        return res.status(400).json({
          status: 'error',
          message: 'Skill ID is required',
        });
      }

      // Check if user is trying to request themselves
      if (mentorId === menteeId) {
        return res.status(400).json({
          status: 'error',
          message: 'You cannot request yourself as a mentor',
        });
      }

      // Check if there's already a pending request
      const existing = await mentorshipModel.checkPendingRequest(menteeId, mentorId, skillId);
      if (existing) {
        return res.status(400).json({
          status: 'error',
          message: 'You already have a pending mentorship request with this person',
        });
      }

      // Create the request
      const request = await mentorshipModel.createRequest({
        menteeId,
        mentorId,
        skillId,
        message: message || 'I would like to request mentorship.',
      });

      res.status(201).json({
        status: 'success',
        message: 'Mentorship request sent successfully',
        data: request,
      });
    } catch (error) {
      console.error('Request mentor error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send mentorship request',
      });
    }
  }

  // Accept a mentorship request
  async acceptRequest(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      // Get the request
      const request = await mentorshipModel.findRequestById(id);
      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Mentorship request not found',
        });
      }

      // Check if user is the mentor
      if (request.mentorId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to accept this request',
        });
      }

      // Check if already accepted
      if (request.status !== 'pending') {
        return res.status(400).json({
          status: 'error',
          message: `This request is already ${request.status}`,
        });
      }

      // Update the request
      const updated = await mentorshipModel.updateRequestStatus(id, 'accepted');

      // Update user's mentor status if not already
      // This will be handled by the user controller

      res.json({
        status: 'success',
        message: 'Mentorship request accepted',
        data: updated,
      });
    } catch (error) {
      console.error('Accept request error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to accept mentorship request',
      });
    }
  }

  // Reject a mentorship request
  async rejectRequest(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      // Get the request
      const request = await mentorshipModel.findRequestById(id);
      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Mentorship request not found',
        });
      }

      // Check if user is the mentor
      if (request.mentorId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to reject this request',
        });
      }

      // Check if already rejected
      if (request.status !== 'pending') {
        return res.status(400).json({
          status: 'error',
          message: `This request is already ${request.status}`,
        });
      }

      // Update the request
      const updated = await mentorshipModel.updateRequestStatus(id, 'rejected');

      res.json({
        status: 'success',
        message: 'Mentorship request rejected',
        data: updated,
      });
    } catch (error) {
      console.error('Reject request error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to reject mentorship request',
      });
    }
  }

  // Get all mentorship requests for the current user
  async getMyRequests(req, res) {
    try {
      const userId = req.userId;

      // Get requests where user is mentee
      const menteeRequests = await mentorshipModel.getMenteeRequests(userId);
      
      // Get requests where user is mentor
      const mentorRequests = await mentorshipModel.getMentorRequests(userId);

      res.json({
        status: 'success',
        data: {
          asMentee: menteeRequests,
          asMentor: mentorRequests,
        },
      });
    } catch (error) {
      console.error('Get my requests error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch mentorship requests',
      });
    }
  }

  // Get a single mentorship request
  async getRequest(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const request = await mentorshipModel.findRequestById(id);
      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Mentorship request not found',
        });
      }

      // Check if user is involved
      if (request.menteeId !== userId && request.mentorId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to view this request',
        });
      }

      res.json({
        status: 'success',
        data: request,
      });
    } catch (error) {
      console.error('Get request error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch mentorship request',
      });
    }
  }

  // Delete a mentorship request
  async deleteRequest(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const request = await mentorshipModel.findRequestById(id);
      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Mentorship request not found',
        });
      }

      // Check if user is involved
      if (request.menteeId !== userId && request.mentorId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to delete this request',
        });
      }

      // Only pending requests can be deleted
      if (request.status !== 'pending') {
        return res.status(400).json({
          status: 'error',
          message: `Cannot delete a request that is ${request.status}`,
        });
      }

      await mentorshipModel.deleteRequest(id);

      res.json({
        status: 'success',
        message: 'Mentorship request deleted successfully',
      });
    } catch (error) {
      console.error('Delete request error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete mentorship request',
      });
    }
  }

  // Create a mentorship session
  async createSession(req, res) {
    try {
      const { requestId, scheduledAt, durationMinutes, locationType, locationDetail, notes } = req.body;
      const userId = req.userId;

      // Validate required fields
      if (!requestId) {
        return res.status(400).json({
          status: 'error',
          message: 'Request ID is required',
        });
      }

      if (!scheduledAt) {
        return res.status(400).json({
          status: 'error',
          message: 'Scheduled date and time is required',
        });
      }

      // Get the request
      const request = await mentorshipModel.findRequestById(requestId);
      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Mentorship request not found',
        });
      }

      // Check if user is involved
      if (request.menteeId !== userId && request.mentorId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to create a session for this request',
        });
      }

      // Check if request is accepted
      if (request.status !== 'accepted') {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot create a session for a request that is not accepted',
        });
      }

      // Create the session
      const session = await mentorshipModel.createSession({
        requestId,
        mentorId: request.mentorId,
        menteeId: request.menteeId,
        scheduledAt,
        durationMinutes,
        locationType,
        locationDetail,
        notes,
      });

      res.status(201).json({
        status: 'success',
        message: 'Mentorship session created successfully',
        data: session,
      });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create mentorship session',
      });
    }
  }

  // Get my sessions
  async getMySessions(req, res) {
    try {
      const userId = req.userId;
      const sessions = await mentorshipModel.getUserSessions(userId);

      res.json({
        status: 'success',
        data: sessions,
      });
    } catch (error) {
      console.error('Get my sessions error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch mentorship sessions',
      });
    }
  }

  // Update session status
  async updateSession(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.userId;

      if (!status) {
        return res.status(400).json({
          status: 'error',
          message: 'Status is required',
        });
      }

      // Get the session
      const sessions = await mentorshipModel.getUserSessions(userId);
      const session = sessions.find(s => s.id === id);

      if (!session) {
        return res.status(404).json({
          status: 'error',
          message: 'Mentorship session not found',
        });
      }

      // Check if user is involved
      if (session.mentorId !== userId && session.menteeId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to update this session',
        });
      }

      const updated = await mentorshipModel.updateSessionStatus(id, status);

      res.json({
        status: 'success',
        message: 'Mentorship session updated successfully',
        data: updated,
      });
    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update mentorship session',
      });
    }
  }
}

module.exports = new MentorshipController();