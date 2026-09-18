// @route GET /api/recommendations/schedule
// @access Private (Manager/Admin) - Year 4 Feature
const getPostingScheduleRecommendation = async (req, res) => {
  try {
    const { platform } = req.query;

    // Rule-based heuristic schedule recommendation
    const recommendations = [
      {
        platform: 'TikTok',
        optimalHour: '19:00 - 21:30',
        bestDays: ['Thursday', 'Friday', 'Sunday'],
        recommendedLength: '30 - 60 seconds',
        reason: 'Peak mobile engagement window for short-form entertainment & tech news.',
      },
      {
        platform: 'YouTube',
        optimalHour: '17:00 - 20:00',
        bestDays: ['Wednesday', 'Saturday'],
        recommendedLength: '8 - 12 minutes',
        reason: 'Optimal index time for algorithmic recommendation before evening prime time.',
      },
      {
        platform: 'Instagram',
        optimalHour: '12:00 - 13:30, 18:00 - 20:00',
        bestDays: ['Monday', 'Thursday'],
        recommendedLength: 'Carousel or 15-second Reel',
        reason: 'Lunch break and commute browsing peaks.',
      },
    ];

    const filtered = platform
      ? recommendations.filter((r) => r.platform.toLowerCase() === platform.toLowerCase())
      : recommendations;

    res.status(200).json({
      success: true,
      data: filtered,
    });
  } catch (error) {
    console.error('getPostingScheduleRecommendation error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'REC_ERROR', message: 'Failed to generate posting recommendation' },
    });
  }
};

module.exports = {
  getPostingScheduleRecommendation,
};

