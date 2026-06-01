// db.js — all Supabase database operations

const _sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const DB = {

  // Save or update a profile (upsert on username)
  async saveProfile(p) {
    const row = {
      username:         p.username.toLowerCase().trim(),
      age:              p.age,
      gender:           p.gender,
      bio:              p.bio || '',
      hobbies:          p.hobbies || [],
      subreddits:       p.subreddits || [],
      intent:           p.intent || '',
      looking_for:      p.lookingFor || {},
      karma:            p.karma || 0,
      account_age_days: p.accountAgeDays || 0,
      color:            p.color || '#FF4500',
    };
    const { data, error } = await _sb
      .from('profiles')
      .upsert(row, { onConflict: 'username' })
      .select()
      .single();
    if (error) throw error;
    return DB._toProfile(data);
  },

  // Fetch all profiles except the current user
  async getOthers(excludeUsername) {
    const { data, error } = await _sb
      .from('profiles')
      .select('*')
      .neq('username', excludeUsername.toLowerCase().trim())
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(DB._toProfile);
  },

  // Fetch a single profile by username
  async getByUsername(username) {
    const { data, error } = await _sb
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase().trim())
      .maybeSingle();
    if (error) throw error;
    return data ? DB._toProfile(data) : null;
  },

  // Check username exists
  async exists(username) {
    const { data } = await _sb
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase().trim())
      .maybeSingle();
    return !!data;
  },

  // Map DB row → app profile shape
  _toProfile(r) {
    return {
      id:             r.id,
      username:       r.username,
      age:            r.age,
      gender:         r.gender,
      bio:            r.bio || '',
      hobbies:        r.hobbies || [],
      subreddits:     r.subreddits || [],
      intent:         r.intent || '',
      lookingFor:     r.looking_for || {},
      karma:          r.karma || 0,
      accountAgeDays: r.account_age_days || 0,
      color:          r.color || '#FF4500',
      createdAt:      r.created_at,
    };
  },
};
