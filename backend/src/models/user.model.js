const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserModel {
  // Create a new user
  async create(data) {
    return await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        county: data.county,
        subCounty: data.subCounty,
        bio: data.bio,
        occupation: data.occupation,
        role: data.role || 'user',
      },
    });
  }

  // Find user by email (includes password and 2FA fields for login)
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        passwordHash: true,
        profilePhoto: true,
        county: true,
        subCounty: true,
        bio: true,
        occupation: true,
        role: true,
        isVerified: true,
        isMentor: true,
        isVolunteer: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackup: true,
        lastLogin: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
  }

  // Find user by phone (includes password and 2FA fields for login)
  async findByPhone(phone) {
    return await prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        passwordHash: true,
        profilePhoto: true,
        county: true,
        subCounty: true,
        bio: true,
        occupation: true,
        role: true,
        isVerified: true,
        isMentor: true,
        isVolunteer: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackup: true,
        lastLogin: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
  }

  // Find user by ID (excludes password, includes 2FA fields)
  async findById(id) {
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
        role: true,
        isVerified: true,
        isMentor: true,
        isVolunteer: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackup: true,
        lastLogin: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
  }

  // Get all users (excludes password)
  async findAll() {
    return await prisma.user.findMany({
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
        role: true,
        isVerified: true,
        isMentor: true,
        isVolunteer: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackup: true,
        lastLogin: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Update user
  async update(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
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
        role: true,
        isVerified: true,
        isMentor: true,
        isVolunteer: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackup: true,
        lastLogin: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
  }

  // Update login stats
  async updateLoginStats(id) {
    return await prisma.user.update({
      where: { id },
      data: {
        lastLogin: new Date(),
        loginCount: {
          increment: 1,
        },
      },
    });
  }

  // Update user role (admin only)
  async updateRole(id, role) {
    return await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        isMentor: true,
        isVolunteer: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Delete user (soft delete)
  async delete(id) {
    return await prisma.user.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
  }

  // Get user by ID with full details (for admin)
  async findByIdFull(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        mentorshipRequestsMentee: {
          include: {
            mentor: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            skill: true,
          },
        },
        mentorshipRequestsMentor: {
          include: {
            mentee: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            skill: true,
          },
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  // Count users
  async count(filters = {}) {
    const where = {
      isActive: true,
    };

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isMentor !== undefined) {
      where.isMentor = filters.isMentor;
    }

    if (filters.isVolunteer !== undefined) {
      where.isVolunteer = filters.isVolunteer;
    }

    return await prisma.user.count({ where });
  }

  // Get users with pagination and filters
  async findWithFilters(filters = {}) {
    const where = {
      isActive: true,
    };

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isMentor !== undefined) {
      where.isMentor = filters.isMentor;
    }

    if (filters.isVolunteer !== undefined) {
      where.isVolunteer = filters.isVolunteer;
    }

    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { occupation: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.user.findMany({
      where,
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
        role: true,
        isVerified: true,
        isMentor: true,
        isVolunteer: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: filters.orderBy || { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });
  }
}

module.exports = new UserModel();