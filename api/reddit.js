export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { username, type } = req.query;

  if (!username || !/^[A-Za-z0-9_-]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'Invalid username' });
  }

  const HEADERS = {
    'User-Agent':      'Mozilla/5.0 (compatible; RedditMatchApp/1.0; +https://github.com/redditMatch)',
    'Accept':          'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control':   'no-cache',
  };

  const urls = {
    about:    `https://www.reddit.com/user/${username}/about.json?raw_json=1`,
    comments: `https://www.reddit.com/user/${username}/comments.json?limit=100&raw_json=1&sort=new`,
  };

  if (!urls[type]) return res.status(400).json({ error: 'type must be "about" or "comments"' });

  try {
    const response = await fetch(urls[type], { headers: HEADERS });

    if (response.status === 404) {
      return res.status(404).json({ error: `u/${username} does not exist on Reddit` });
    }

    if (response.status === 403) {
      const fallbackUrl = urls[type].replace('www.reddit.com', 'old.reddit.com');
      const r2 = await fetch(fallbackUrl, { headers: HEADERS });
      if (!r2.ok) return res.status(503).json({ error: `Reddit is blocking right now. Try again in a minute.` });
      return res.status(200).json(await r2.json());
    }

    if (!response.ok) return res.status(response.status).json({ error: `Reddit returned ${response.status}` });

    const data = await response.json();
    if (data.error) return res.status(data.error).json({ error: data.message || 'Reddit error' });

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Proxy fetch failed: ' + err.message });
  }
}
