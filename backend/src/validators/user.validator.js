const { z } = require('zod');

// Update profile validation
const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100).optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().regex(/^[0-9]{10,15}$/, 'Invalid phone number').optional(),
    county: z.string().min(2, 'County is required').optional(),
    subCounty: z.string().optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    occupation: z.string().max(100).optional(),
    profilePhoto: z.string().url('Invalid URL format').optional(),
  }),
});

// Get users with filters
const getUsersSchema = z.object({
  query: z.object({
    role: z.enum(['admin', 'moderator', 'mentor', 'volunteer', 'student', 'user']).optional(),
    isMentor: z.enum(['true', 'false']).optional(),
    isVolunteer: z.enum(['true', 'false']).optional(),
    search: z.string().optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    offset: z.string().regex(/^\d+$/).optional(),
  }),
});

// User ID param validation
const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

module.exports = {
  updateProfileSchema,
  getUsersSchema,
  userIdParamSchema,
};