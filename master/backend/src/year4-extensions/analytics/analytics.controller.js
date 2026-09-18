const Content = require('../../database/models/Content');

// @route GET /api/analytics/overview
// @access Private (Manager/Admin) - Year 4 Feature
const getAnalyticsOverview = async (req, res) => {
  try {
    const contents = await Content.find().select('title platform status metrics publishedAt');

    const totalContents = contents.length;
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;

    const platformBreakdown = {
      YouTube: { count: 0, views: 0 },
      TikTok: { count: 0, views: 0 },
      Instagram: { count: 0, views: 0 },
    };

    contents.forEach((c) => {
      const p = c.platform || 'TikTok';
      if (platformBreakdown[p]) {
        platformBreakdown[p].count += 1;
      }

      if (Array.isArray(c.metrics) && c.metrics.length > 0) {
        const latest = c.metrics[c.metrics.length - 1];
        totalViews += latest.views || 0;
        totalLikes += latest.likes || 0;
        totalComments += latest.comments || 0;
        totalShares += latest.shares || 0;

        if (platformBreakdown[p]) {
          platformBreakdown[p].views += latest.views || 0;
        }
      }
    });

    const averageEngagement = totalViews > 0
      ? Number((((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(2))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalContents,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        averageEngagementRate: averageEngagement,
        platformBreakdown,
      },
    });
  } catch (error) {
    console.error('getAnalyticsOverview error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ANALYTICS_ERROR', message: 'Failed to generate analytics overview' },
    });
  }
};

module.exports = {
  getAnalyticsOverview,
};

