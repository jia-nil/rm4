// reddit.js — fetches Reddit data via our own Vercel proxy (/api/reddit)
// This avoids CORS entirely since the proxy runs server-side on Vercel.

const Reddit = {

  async fetch(username) {
    const [about, comments] = await Promise.all([
      this._call(username, 'about'),
      this._call(username, 'comments'),
    ]);

    if (!about?.data) throw new Error(`u/${username} not found on Reddit`);

    const d = about.data;
    const accountAgeDays = Math.floor((Date.now() - d.created_utc * 1000) / 86400000);
    const karma = (d.link_karma || 0) + (d.comment_karma || 0);

    // Derive top subreddits from comment history
    const subCounts = {};
    const commentTexts = [];
    for (const child of (comments?.data?.children || [])) {
      const c = child.data;
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
      username:       d.name,
      karma,
      accountAgeDays,
      topSubs,
      commentSample:  commentTexts.slice(0, 8).join(' | '),
    };
  },

  // Calls our own /api/reddit?username=X&type=Y proxy
  async _call(username, type) {
    const url = `/api/reddit?username=${encodeURIComponent(username)}&type=${type}`;
    const r = await fetch(url);
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.error || `Request failed (${r.status})`);
    }
    return r.json();
  },
};
