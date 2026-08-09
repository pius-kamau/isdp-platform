const { z } = require('zod');

// Request mentorship validation
const requestMentorshipSchema = z.object({
  body: z.object({
    mentorId: z.string().min(1, 'Mentor ID is required'),
    skillId: z.string().min(1, 'Skill ID is required'),
    message: z.string().min(10, 'Message must be at least 10 characters').max(500),
  }),
});

// Create session validation
const createSessionSchema = z.object({
  body: z.object({
    requestId: z.string().min(1, 'Request ID is required'),
    scheduledAt: z.string().datetime({ message: 'Invalid date format' }),
    durationMinutes: z.number().min(15).max(480).default(60),
    locationType: z.enum(['physical', 'virtual', 'hybrid']).default('virtual'),
    locationDetail: z.string().optional(),
    notes: z.string().max(500).optional(),
  }),
});

// Update session validation
const updateSessionSchema = z.object({
  body: z.object({
    status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled']),
    notes: z.string().max(500).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Session ID is required'),
  }),
});

// Mentorship request ID param
const mentorshipIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Request ID is required'),
  }),
});

module.exports = {
  requestMentorshipSchema,
  createSessionSchema,
  updateSessionSchema,
  mentorshipIdParamSchema,
};