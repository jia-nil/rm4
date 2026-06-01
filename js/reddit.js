// reddit.js — fetches public Reddit data, no API key or OAuth needed

const Reddit = {

  // Fetch everything we need about a user
  async fetch(username) {
    const [about, comments] = await Promise.all([
      this._getAbout(username),
      this._getComments(username),
    ]);

    // Derive top subreddits from comment history
    const subCounts = {};
    const commentTexts = [];
    for (const c of comments) {
      const sub = 'r/' + c.subreddit;
      subCounts[sub] = (subCounts[sub] || 0) + 1;
      if (c.body && c.body !== '[deleted]' && c.body.length > 20) {
        commentTexts.push(c.body.slice(0, 300));
      }
    }

    const topSubs = Object.entries(subCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([s]) => s);

    return {
      username:        about.username,
      karma:           about.karma,
      accountAgeDays:  about.accountAgeDays,
      topSubs,
      // Pass recent comment snippets to AI for richer bio
      commentSample:   commentTexts.slice(0, 8).join(' | '),
    };
  },

  async _getAbout(username) {
    const data = await this._call(`https://www.reddit.com/user/${username}/about.json`);
    if (!data?.data) throw new Error(`u/${username} not found on Reddit`);
    const d = data.data;
    return {
      username:       d.name,
      karma:          (d.link_karma || 0) + (d.comment_karma || 0),
      accountAgeDays: Math.floor((Date.now() - d.created_utc * 1000) / 86400000),
    };
  },

  async _getComments(username) {
    const data = await this._call(`https://www.reddit.com/user/${username}/comments.json?limit=100&raw_json=1`);
    return (data?.data?.children || []).map(c => c.data);
  },

  // Try direct first, fall back to CORS proxy for hosted environments
  async _call(url) {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'RedditMatch/1.0' },
      });
      if (r.ok) return r.json();
      throw new Error('HTTP ' + r.status);
    } catch (_) {
      const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const r2 = await fetch(proxy);
      if (!r2.ok) throw new Error('Could not reach Reddit API');
      const w = await r2.json();
      return JSON.parse(w.contents);
    }
  },
};
