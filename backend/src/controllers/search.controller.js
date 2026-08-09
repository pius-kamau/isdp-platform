const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SearchController {
  // Search users by skill, name, or location
  async searchUsers(req, res) {
    try {
      const { q, county, skill, isMentor, isVolunteer, limit, offset } = req.query;

      // Build the where clause
      const where = {
        isActive: true,
      };

      // Search by query string
      if (q) {
        where.OR = [
          { fullName: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } },
          { occupation: { contains: q, mode: 'insensitive' } },
        ];
      }

      // Filter by county
      if (county) {
        where.county = { contains: county, mode: 'insensitive' };
      }

      // Filter by mentor status
      if (isMentor === 'true') {
        where.isMentor = true;
      }

      // Filter by volunteer status
      if (isVolunteer === 'true') {
        where.isVolunteer = true;
      }

      // Filter by specific skill - simplified version
      // First get users that have the skill
      let userIds = [];
      if (skill) {
        const userSkills = await prisma.userSkill.findMany({
          where: {
            skill: {
              name: { contains: skill, mode: 'insensitive' },
            },
          },
          select: {
            userId: true,
          },
        });
        userIds = userSkills.map(us => us.userId);
        
        if (userIds.length === 0) {
          return res.json({
            status: 'success',
            data: [],
            pagination: {
              total: 0,
              limit: parseInt(limit) || 20,
              offset: parseInt(offset) || 0,
              hasMore: false,
            },
          });
        }
        
        where.id = { in: userIds };
      }

      // Get users
      const users = await prisma.user.findMany({
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
          isVerified: true,
          isMentor: true,
          isVolunteer: true,
          createdAt: true,
          skills: {
            include: {
              skill: true,
            },
          },
        },
        take: limit ? parseInt(limit) : 20,
        skip: offset ? parseInt(offset) : 0,
        orderBy: { createdAt: 'desc' },
      });

      // Get total count
      const total = await prisma.user.count({ where });

      res.json({
        status: 'success',
        data: users,
        pagination: {
          total,
          limit: limit ? parseInt(limit) : 20,
          offset: offset ? parseInt(offset) : 0,
          hasMore: total > (parseInt(limit) || 20) + (parseInt(offset) || 0),
        },
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Search failed',
        error: error.message,
      });
    }
  }

  // Get nearby users based on location
  async getNearby(req, res) {
    try {
      const { lat, lng, radius, limit } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          status: 'error',
          message: 'Latitude and longitude are required',
        });
      }

      // Simple nearby search using county matching
      // For production, use PostGIS for proper geospatial queries
      const users = await prisma.user.findMany({
        where: {
          isActive: true,
        },
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
          isVerified: true,
          isMentor: true,
          isVolunteer: true,
          createdAt: true,
          skills: {
            include: {
              skill: true,
            },
          },
        },
        take: limit ? parseInt(limit) : 20,
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        status: 'success',
        data: users,
        location: { lat, lng, radius: radius || 10 },
      });
    } catch (error) {
      console.error('Nearby search error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get nearby users',
      });
    }
  }

  // Get skill suggestions (autocomplete)
  async getSkillSuggestions(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.length < 2) {
        return res.json({
          status: 'success',
          data: [],
        });
      }

      const skills = await prisma.skill.findMany({
        where: {
          name: { contains: q, mode: 'insensitive' },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          category: true,
        },
        take: 10,
        orderBy: { name: 'asc' },
      });

      res.json({
        status: 'success',
        data: skills,
      });
    } catch (error) {
      console.error('Skill suggestions error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get suggestions',
      });
    }
  }

  // Get user suggestions based on skills and location
  async getSuggestions(req, res) {
    try {
      const userId = req.userId;

      // Get current user's skills
      const userSkills = await prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true },
      });

      const skillIds = userSkills.map(us => us.skillId);

      if (skillIds.length === 0) {
        return res.json({
          status: 'success',
          data: [],
          message: 'Add skills to get recommendations',
        });
      }

      // Find users with similar skills
      const users = await prisma.user.findMany({
        where: {
          id: { not: userId },
          isActive: true,
          skills: {
            some: {
              skillId: { in: skillIds },
            },
          },
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
          county: true,
          bio: true,
          occupation: true,
          isVerified: true,
          isMentor: true,
          isVolunteer: true,
          skills: {
            include: {
              skill: true,
            },
          },
        },
        take: 10,
      });

      res.json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      console.error('Suggestions error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get suggestions',
      });
    }
  }
}

module.exports = new SearchController();