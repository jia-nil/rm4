// ai.js — generates bio using OpenRouter AI from Reddit history

const AI = {

  // Generate a bio from real Reddit activity data
  async generateBio({ username, topSubs, commentSample, karma, accountAgeDays }) {
    const subsText    = topSubs.slice(0, 10).join(', ') || 'unknown subreddits';
    const karmaNote   = karma > 50000 ? 'highly active' : karma > 5000 ? 'active' : 'occasional';
    const ageNote     = accountAgeDays > 365 * 3 ? 'long-time' : accountAgeDays > 365 ? 'established' : 'newer';
    const commentNote = commentSample
      ? `Their recent comments include snippets like: "${commentSample.slice(0, 400)}"`
      : '';

    const prompt = `You are writing a fun, honest dating-app style bio for a Reddit user.

User info:
- Username: u/${username}
- Reddit karma: ${karma.toLocaleString()} (${karmaNote} Redditor)
- Account age: ${accountAgeDays} days (${ageNote} user)
- Most active subreddits: ${subsText}
- ${commentNote}

Write a 2-3 sentence bio in first person that:
1. Reflects their actual interests based on their subreddits
2. Has a casual, genuine Reddit-user personality
3. Is specific — mention actual subreddits or topics they care about
4. Feels human, not corporate
5. Does NOT start with "I am" or "I'm a"

Return ONLY the bio text. No quotes, no labels, no explanation.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'RedditMatch',
      },
      body: JSON.stringify({
        model: CONFIG.AI_MODEL,
        max_tokens: 150,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'OpenRouter request failed');
    }

    const data = await response.json();
    const bio  = data.choices?.[0]?.message?.content?.trim();
    if (!bio) throw new Error('Empty response from AI');
    return bio;
  },
};
