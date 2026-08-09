const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SkillModel {
  // Create a new skill
  async create(data) {
    return await prisma.skill.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        icon: data.icon,
      },
    });
  }

  // Find skill by name
  async findByName(name) {
    return await prisma.skill.findUnique({
      where: { name },
    });
  }

  // Find skill by ID
  async findById(id) {
    return await prisma.skill.findUnique({
      where: { id },
      include: {
        userSkills: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                county: true,
              },
            },
          },
        },
      },
    });
  }

  // Get all skills
  async findAll() {
    return await prisma.skill.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        userSkills: {
          select: {
            userId: true,
          },
        },
      },
    });
  }

  // Get skills by category
  async findByCategory(category) {
    return await prisma.skill.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  // Update skill
  async update(id, data) {
    return await prisma.skill.update({
      where: { id },
      data,
    });
  }

  // Delete skill (soft delete)
  async delete(id) {
    return await prisma.skill.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Add skill to user
  async addUserSkill(data) {
    return await prisma.userSkill.create({
      data: {
        userId: data.userId,
        skillId: data.skillId,
        proficiencyLevel: data.proficiencyLevel || 'intermediate',
        yearsExperience: data.yearsExperience,
        isMentor: data.isMentor || false,
        isVolunteer: data.isVolunteer || false,
        evidenceUrl: data.evidenceUrl || [],
      },
      include: {
        skill: true,
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

  // Get user's skills
  async getUserSkills(userId) {
    return await prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: true,
      },
      orderBy: {
        skill: {
          name: 'asc',
        },
      },
    });
  }

  // Update user skill
  async updateUserSkill(id, data) {
    return await prisma.userSkill.update({
      where: { id },
      data,
      include: {
        skill: true,
      },
    });
  }

  // Remove user skill
  async removeUserSkill(id) {
    return await prisma.userSkill.delete({
      where: { id },
    });
  }

  // Find user skill by user and skill
  async findUserSkill(userId, skillId) {
    return await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
    });
  }
}

module.exports = new SkillModel();