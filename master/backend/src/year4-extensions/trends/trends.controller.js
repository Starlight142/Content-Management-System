// @route GET /api/trends
// @access Private (Manager/Admin) - Year 4 Feature
const getTrendingTopics = async (req, res) => {
  try {
    const trends = [
      {
        id: 'tr_1',
        topic: 'AI Agent & Pair Programming',
        category: 'Tech & Software',
        trendGrowth: 42.5,
        trendScore: 94,
        suggestedPlatforms: ['YouTube', 'TikTok'],
        relatedHashtags: ['#coding', '#developer', '#techreview'],
      },
      {
        id: 'tr_2',
        topic: 'Smart Home Gadgets 2026',
        category: 'Consumer Electronics',
        trendGrowth: 28.0,
        trendScore: 82,
        suggestedPlatforms: ['YouTube', 'Instagram'],
        relatedHashtags: ['#smarthome', '#gadgets', '#minimalist'],
      },
      {
        id: 'tr_3',
        topic: 'Behind the Scenes Studio Workflow',
        category: 'Creator Economy',
        trendGrowth: 35.8,
        trendScore: 89,
        suggestedPlatforms: ['TikTok', 'Instagram'],
        relatedHashtags: ['#filmmaking', '#videoediting', '#behindthescenes'],
      },
    ];

    res.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error('getTrendingTopics error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'TRENDS_ERROR', message: 'Failed to retrieve trends' },
    });
  }
};

module.exports = {
  getTrendingTopics,
};

