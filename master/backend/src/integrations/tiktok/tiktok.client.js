/**
 * TikTok Display API & Video Insights Client (Year 4 Blueprint)
 * 
 * Requirements for Year 4 activation:
 * 1. TikTok for Developers Account
 * 2. TikTok Login Kit & Video Display API App Approval
 * 3. Client Key & Client Secret
 */

class TikTokClient {
  constructor(clientKey = process.env.TIKTOK_CLIENT_KEY) {
    this.clientKey = clientKey;
    this.baseUrl = 'https://open.tiktokapis.com/v2';
  }

  // Fetch TikTok video insights
  async getVideoInsights(videoId, accessToken) {
    if (!accessToken) {
      console.warn('[TikTokClient] Running in mock mode (No access token provided)');
      return {
        videoId,
        views: 88500,
        likes: 12300,
        shares: 4200,
        comments: 980,
      };
    }

    const res = await fetch(`${this.baseUrl}/video/query/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filters: { video_ids: [videoId] },
      }),
    });

    return await res.json();
  }
}

module.exports = new TikTokClient();

