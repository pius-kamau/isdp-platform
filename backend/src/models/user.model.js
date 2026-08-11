const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const userModel = {
  // Find user by ID (full profile)
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        experience: true,
        qualifications: true,
        volunteering: true,
        availability: true,
      },
    });
  },

  // Find user by ID (basic info only)
  async findByIdBasic(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        profilePhoto: true,
        county: true,
        subCounty: true,
        bio: true,
        occupation: true,
        isMentor: true,
        isVolunteer: true,
        isVerified: true,
        isActive: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // Find user by email
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  // Create user
  async create(data) {
    return await prisma.user.create({
      data,
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        experience: true,
        qualifications: true,
        volunteering: true,
        availability: true,
      },
    });
  },

  // Update user
  async update(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        experience: true,
        qualifications: true,
        volunteering: true,
        availability: true,
      },
    });
  },

  // Delete user (soft delete)
  async delete(id) {
    return await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  // Get all users
  async findAll() {
    return await prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        experience: true,
        qualifications: true,
        volunteering: true,
        availability: true,
      },
    });
  },
};

module.exports = userModel;
