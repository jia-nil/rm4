

export default async function handler(req, res) {
  // Allow your Vercel domain (and localhost for dev)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { username, type } = req.query;

  if (!username || !type) {
    return res.status(400).json({ error: 'Missing username or type param' });
  }

  // Sanitise — only allow safe Reddit usernames
  if (!/^[A-Za-z0-9_-]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'Invalid username' });
  }

  const urls = {
    about:    `https://www.reddit.com/user/${username}/about.json`,
    comments: `https://www.reddit.com/user/${username}/comments.json?limit=100&raw_json=1`,
  };

  if (!urls[type]) {
    return res.status(400).json({ error: 'type must be about or comments' });
  }

  try {
    const response = await fetch(urls[type], {
      headers: {
        'User-Agent': 'RedditMatch/1.0 (matchmaking app; contact via github)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Reddit returned ${response.status}`,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
