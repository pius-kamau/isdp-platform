const analyticsService = require('../services/analytics.service');

class AnalyticsController {
  // Get dashboard overview
  async getDashboard(req, res) {
    try {
      const stats = await analyticsService.getDashboardStats();

      res.json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get dashboard statistics',
      });
    }
  }

  // Get user growth data
  async getUserGrowth(req, res) {
    try {
      const { period } = req.query; // daily, weekly, monthly
      const data = await analyticsService.getUserGrowth(period || 'weekly');

      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      console.error('Get user growth error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get user growth data',
      });
    }
  }

  // Get mentorship statistics
  async getMentorshipStats(req, res) {
    try {
      const stats = await analyticsService.getMentorshipStats();

      res.json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      console.error('Get mentorship stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get mentorship statistics',
      });
    }
  }

  // Get geographic distribution
  async getGeographicDistribution(req, res) {
    try {
      const data = await analyticsService.getGeographicDistribution();

      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      console.error('Get geographic distribution error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get geographic distribution',
      });
    }
  }

  // Get engagement metrics
  async getEngagementMetrics(req, res) {
    try {
      const data = await analyticsService.getEngagementMetrics();

      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      console.error('Get engagement metrics error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get engagement metrics',
      });
    }
  }

  // Get full analytics summary
  async getFullAnalytics(req, res) {
    try {
      const data = await analyticsService.getFullAnalytics();

      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      console.error('Get full analytics error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get full analytics',
      });
    }
  }
}

module.exports = new AnalyticsController();