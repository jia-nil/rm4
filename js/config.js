// =============================================================
//  config.js  —  PASTE YOUR KEYS HERE
// =============================================================

const CONFIG = {

  // 1. Supabase — https://supabase.com → Settings → API
  SUPABASE_URL:      'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',

  // 2. OpenRouter — https://openrouter.ai/keys
  OPENROUTER_KEY:    'sk-or-YOUR_OPENROUTER_KEY',

  // 3. OpenRouter model (cheap + fast — change if you want)
  AI_MODEL: 'mistralai/mistral-7b-instruct',
};

// =============================================================
//  SUPABASE TABLE — run this SQL once in Supabase SQL Editor
// =============================================================
//
//  CREATE TABLE profiles (
//    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//    username         TEXT UNIQUE NOT NULL,
//    age              INTEGER NOT NULL,
//    gender           TEXT NOT NULL,
//    bio              TEXT DEFAULT '',
//    hobbies          TEXT[]      DEFAULT '{}',
//    subreddits       TEXT[]      DEFAULT '{}',
//    intent           TEXT        DEFAULT '',
//    looking_for      JSONB       DEFAULT '{}',
//    karma            INTEGER     DEFAULT 0,
//    account_age_days INTEGER     DEFAULT 0,
//    color            TEXT        DEFAULT '#FF4500',
//    created_at       TIMESTAMPTZ DEFAULT NOW()
//  );
//
//  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
//  CREATE POLICY "read all"   ON profiles FOR SELECT USING (true);
//  CREATE POLICY "insert own" ON profiles FOR INSERT WITH CHECK (true);
//  CREATE POLICY "update own" ON profiles FOR UPDATE USING (true);
//
// =============================================================
