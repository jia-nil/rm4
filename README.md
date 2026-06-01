# RedditMatch 🤝

Real Reddit profiles, real database, AI-written bios, zero fake data.

## How It Works

1. User enters Reddit username on landing page
2. App fetches public Reddit data (karma, account age, top subreddits, comment snippets)
3. OpenRouter AI reads that data and writes a bio
4. User edits bio, picks hobbies, sets age/gender/intent
5. User sets preferences (who they're looking for)
6. Profile saved to Supabase database
7. App searches database for matching registered users
8. Results shown with match score, shared subreddits, shared hobbies
9. Connect button → opens their Reddit profile to DM them directly

## Setup (5 minutes)

### Step 1 — Supabase
1. Go to https://supabase.com → create a new project
2. Settings → API → copy **Project URL** and **anon public** key
3. Go to SQL Editor → New query → paste and run:

```sql
CREATE TABLE profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username         TEXT UNIQUE NOT NULL,
  age              INTEGER NOT NULL,
  gender           TEXT NOT NULL,
  bio              TEXT DEFAULT '',
  hobbies          TEXT[]      DEFAULT '{}',
  subreddits       TEXT[]      DEFAULT '{}',
  intent           TEXT        DEFAULT '',
  looking_for      JSONB       DEFAULT '{}',
  karma            INTEGER     DEFAULT 0,
  account_age_days INTEGER     DEFAULT 0,
  color            TEXT        DEFAULT '#FF4500',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read all"   ON profiles FOR SELECT USING (true);
CREATE POLICY "insert own" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "update own" ON profiles FOR UPDATE USING (true);
```

### Step 2 — OpenRouter
1. Go to https://openrouter.ai/keys → create a key
2. Default model: `mistralai/mistral-7b-instruct` (cheap, fast)
3. Change to `openai/gpt-4o-mini` or `anthropic/claude-haiku` for better bios

### Step 3 — Paste keys
Open `js/config.js` and fill in:

```js
SUPABASE_URL:      'https://YOUR_PROJECT.supabase.co',
SUPABASE_ANON_KEY: 'YOUR_ANON_KEY',
OPENROUTER_KEY:    'sk-or-YOUR_KEY',
AI_MODEL:          'mistralai/mistral-7b-instruct',
```

### Step 4 — Host
**Netlify Drop:** drag the `redditMatch` folder to https://app.netlify.com/drop

**Local:** `npx serve .` or `python3 -m http.server 3000`

## File Structure

```
redditMatch/
├── index.html
├── css/
│   ├── base.css       Variables, reset, animations
│   ├── nav.css
│   ├── hero.css       Landing page + username input
│   ├── flow.css       3-step profile creation
│   └── results.css    Match cards
├── js/
│   ├── config.js      ← YOUR KEYS GO HERE
│   ├── db.js          All Supabase operations
│   ├── reddit.js      Reddit public API fetch
│   ├── ai.js          OpenRouter bio generation
│   ├── match.js       Scoring + ranking algorithm
│   ├── utils.js       Shared helpers + constants
│   ├── app.js         Bootstrap
│   └── pages/
│       ├── hero.js    Landing page
│       ├── flow.js    Profile creation (Reddit fetch → AI bio → preferences)
│       └── results.js Match results
└── README.md
```

## Match Score Formula

```
score = (shared subreddits × 18)
      + (shared hobbies    × 12)
      + (same intent       × 20)
      + (age in range      × 10)
      + (gender match      × 10)
      + karma tier match    × 5
```

Gender mismatch returns score 0 (filtered out entirely).
