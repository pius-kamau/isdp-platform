const { z } = require('zod');

// Create skill validation
const createSkillSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Skill name must be at least 2 characters').max(100),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    category: z.string().min(2, 'Category is required'),
    icon: z.string().optional(),
  }),
});

// Update skill validation
const updateSkillSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Skill name must be at least 2 characters').max(100).optional(),
    description: z.string().max(500).optional(),
    category: z.string().min(2).optional(),
    icon: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Skill ID is required'),
  }),
});

// Add user skill validation
const addUserSkillSchema = z.object({
  body: z.object({
    skillId: z.string().min(1, 'Skill ID is required'),
    proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
    yearsExperience: z.number().min(0).max(50).optional(),
    isMentor: z.boolean().default(false),
    isVolunteer: z.boolean().default(false),
  }),
});

// Skill ID param validation
const skillIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Skill ID is required'),
  }),
});

module.exports = {
  createSkillSchema,
  updateSkillSchema,
  addUserSkillSchema,
  skillIdParamSchema,
};