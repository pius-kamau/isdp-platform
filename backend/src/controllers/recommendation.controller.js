const recommendationService = require('../services/recommendation.service');

class RecommendationController {
  // Get general recommendations for current user
  async getRecommendations(req, res) {
    try {
      const userId = req.userId;
      const { limit } = req.query;

      const recommendations = await recommendationService.getRecommendations(
        userId,
        limit ? parseInt(limit) : 10
      );

      res.json({
        status: 'success',
        data: recommendations,
        count: recommendations.length,
      });
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get recommendations',
      });
    }
  }

  // Get mentor recommendations
  async getMentorRecommendations(req, res) {
    try {
      const userId = req.userId;
      const { limit } = req.query;

      const recommendations = await recommendationService.getMentorRecommendations(
        userId,
        limit ? parseInt(limit) : 10
      );

      res.json({
        status: 'success',
        data: recommendations,
        count: recommendations.length,
      });
    } catch (error) {
      console.error('Get mentor recommendations error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get mentor recommendations',
      });
    }
  }

  // Get volunteer recommendations
  async getVolunteerRecommendations(req, res) {
    try {
      const userId = req.userId;
      const { limit } = req.query;

      const recommendations = await recommendationService.getVolunteerRecommendations(
        userId,
        limit ? parseInt(limit) : 10
      );

      res.json({
        status: 'success',
        data: recommendations,
        count: recommendations.length,
      });
    } catch (error) {
      console.error('Get volunteer recommendations error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get volunteer recommendations',
      });
    }
  }

  // Get nearby recommendations
  async getNearbyRecommendations(req, res) {
    try {
      const userId = req.userId;
      const { limit } = req.query;

      const recommendations = await recommendationService.getNearbyRecommendations(
        userId,
        limit ? parseInt(limit) : 10
      );

      res.json({
        status: 'success',
        data: recommendations,
        count: recommendations.length,
      });
    } catch (error) {
      console.error('Get nearby recommendations error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get nearby recommendations',
      });
    }
  }

  // Calculate recommendation score between two users
  async calculateScore(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.userId;

      // Get both users
      const user1 = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

      const user2 = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

      if (!user1 || !user2) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      const score = await recommendationService.generateRecommendationScore(user1, user2);

      res.json({
        status: 'success',
        data: {
          userId: userId,
          score: score,
        },
      });
    } catch (error) {
      console.error('Calculate score error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to calculate recommendation score',
      });
    }
  }
}

module.exports = new RecommendationController();