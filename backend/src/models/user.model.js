const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const userModel = {
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

  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

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

  async delete(id) {
    return await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

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
