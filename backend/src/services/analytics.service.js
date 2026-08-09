const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AnalyticsService {
  // Get dashboard overview statistics
  async getDashboardStats() {
    const [
      totalUsers,
      totalSkills,
      totalMentors,
      totalVolunteers,
      totalMentorshipRequests,
      totalMessages,
      recentUsers,
      popularSkills,
      skillsByCategory,
    ] = await Promise.all([
      // Total users
      prisma.user.count({
        where: { isActive: true },
      }),
      
      // Total skills
      prisma.skill.count({
        where: { isActive: true },
      }),
      
      // Total mentors
      prisma.user.count({
        where: {
          isActive: true,
          isMentor: true,
        },
      }),
      
      // Total volunteers
      prisma.user.count({
        where: {
          isActive: true,
          isVolunteer: true,
        },
      }),
      
      // Total mentorship requests
      prisma.mentorRequest.count(),
      
      // Total messages
      prisma.message.count(),
      
      // Recent users (last 7 days)
      prisma.user.findMany({
        where: {
          isActive: true,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          county: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      
      // Popular skills (most users have)
      prisma.skill.findMany({
        where: { isActive: true },
        include: {
          userSkills: true,
        },
        take: 10,
      }),
      
      // Skills by category
      prisma.skill.groupBy({
        by: ['category'],
        _count: {
          id: true,
        },
        where: {
          isActive: true,
          category: {
            not: null,
          },
        },
      }),
    ]);

    // Format popular skills with user count
    const formattedPopularSkills = popularSkills.map(skill => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      userCount: skill.userSkills.length,
    }));

    // Sort by user count
    formattedPopularSkills.sort((a, b) => b.userCount - a.userCount);

    // Calculate growth (users added in last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [currentMonthUsers, previousMonthUsers] = await Promise.all([
      prisma.user.count({
        where: {
          isActive: true,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.user.count({
        where: {
          isActive: true,
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),
    ]);

    const growthRate = previousMonthUsers === 0
      ? currentMonthUsers > 0 ? 100 : 0
      : Math.round(((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100);

    return {
      overview: {
        totalUsers,
        totalSkills,
        totalMentors,
        totalVolunteers,
        totalMentorshipRequests,
        totalMessages,
      },
      growth: {
        newUsersThisMonth: currentMonthUsers,
        growthRate,
      },
      recentUsers,
      popularSkills: formattedPopularSkills.slice(0, 5),
      skillsByCategory,
    };
  }

  // Get user growth data (daily/weekly/monthly)
  async getUserGrowth(period = 'weekly') {
    try {
      let startDate;
      let groupByFormat;

      switch (period) {
        case 'daily':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          groupByFormat = '%Y-%m-%d';
          break;
        case 'monthly':
          startDate = new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000);
          groupByFormat = '%Y-%m';
          break;
        default: // weekly
          startDate = new Date(Date.now() - 52 * 7 * 24 * 60 * 60 * 1000);
          groupByFormat = '%Y-%W';
      }

      // Get raw data from database using Prisma raw query
      const users = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', "createdAt") as date,
          COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= ${startDate}
          AND "isActive" = true
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY date ASC
      `;

      return users;
    } catch (error) {
      console.error('Get user growth error:', error);
      return [];
    }
  }

  // Get mentorship statistics
  async getMentorshipStats() {
    try {
      const [
        totalRequests,
        pendingRequests,
        acceptedRequests,
        rejectedRequests,
        completedRequests,
      ] = await Promise.all([
        prisma.mentorRequest.count(),
        prisma.mentorRequest.count({
          where: { status: 'pending' },
        }),
        prisma.mentorRequest.count({
          where: { status: 'accepted' },
        }),
        prisma.mentorRequest.count({
          where: { status: 'rejected' },
        }),
        prisma.mentorRequest.count({
          where: { status: 'completed' },
        }),
      ]);

      // Get top mentors
      const mentorStats = await prisma.mentorRequest.groupBy({
        by: ['mentorId'],
        _count: {
          id: true,
        },
        where: {
          status: 'accepted',
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 5,
      });

      // Get mentor details
      const topMentors = await Promise.all(
        mentorStats.map(async (stat) => {
          const user = await prisma.user.findUnique({
            where: { id: stat.mentorId },
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true,
              county: true,
            },
          });
          return {
            ...user,
            mentorshipCount: stat._count.id,
          };
        })
      );

      return {
        totalRequests,
        pendingRequests,
        acceptedRequests,
        rejectedRequests,
        completedRequests,
        acceptanceRate: totalRequests > 0
          ? Math.round((acceptedRequests / totalRequests) * 100)
          : 0,
        topMentors,
      };
    } catch (error) {
      console.error('Get mentorship stats error:', error);
      return {
        totalRequests: 0,
        pendingRequests: 0,
        acceptedRequests: 0,
        rejectedRequests: 0,
        completedRequests: 0,
        acceptanceRate: 0,
        topMentors: [],
      };
    }
  }

  // Get geographic distribution of users
  async getGeographicDistribution() {
    try {
      const usersByCounty = await prisma.user.groupBy({
        by: ['county'],
        _count: {
          id: true,
        },
        where: {
          isActive: true,
          county: {
            not: null,
          },
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });

      return {
        usersByCounty,
      };
    } catch (error) {
      console.error('Get geographic distribution error:', error);
      return { usersByCounty: [] };
    }
  }

  // Get user engagement metrics
  async getEngagementMetrics() {
    try {
      const totalUsers = await prisma.user.count({
        where: { isActive: true },
      });

      const activeUsers = await prisma.user.count({
        where: {
          isActive: true,
          lastLogin: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });

      const usersWithSkills = await prisma.user.count({
        where: {
          isActive: true,
          skills: {
            some: {},
          },
        },
      });

      const usersWithMentorships = await prisma.user.count({
        where: {
          isActive: true,
          OR: [
            { isMentor: true },
          ],
        },
      });

      return {
        activeUsers,
        usersWithSkills,
        usersWithMentorships,
        engagementRate: totalUsers > 0
          ? Math.round((activeUsers / totalUsers) * 100)
          : 0,
        messagesPerDay: 0,
      };
    } catch (error) {
      console.error('Get engagement metrics error:', error);
      return {
        activeUsers: 0,
        usersWithSkills: 0,
        usersWithMentorships: 0,
        engagementRate: 0,
        messagesPerDay: 0,
      };
    }
  }

  // Get platform summary (all stats combined)
  async getFullAnalytics() {
    try {
      const [
        dashboard,
        mentorship,
        geographic,
        engagement,
      ] = await Promise.all([
        this.getDashboardStats(),
        this.getMentorshipStats(),
        this.getGeographicDistribution(),
        this.getEngagementMetrics(),
      ]);

      return {
        dashboard,
        mentorship,
        geographic,
        engagement,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Get full analytics error:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();