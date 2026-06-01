// match.js — scores and ranks profiles from the database

const Match = {

  // Given current user, score all others and return ranked list
  rank(currentUser, others) {
    return others
      .map(p => ({ ...p, score: this._score(currentUser, p) }))
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score);
  },

  _score(me, them) {
    let score = 0;

    // Shared subreddits (strongest signal — actual overlap in communities)
    const mySubs   = me.subreddits || [];
    const theirSubs = them.subreddits || [];
    const sharedSubs = mySubs.filter(s => theirSubs.includes(s)).length;
    score += sharedSubs * 18;

    // Shared hobbies
    const myHobbies    = me.hobbies || [];
    const theirHobbies = them.hobbies || [];
    const sharedHobbies = myHobbies.filter(h => theirHobbies.includes(h)).length;
    score += sharedHobbies * 12;

    // Intent match (both want same thing)
    if (me.intent && them.intent && me.intent === them.intent) score += 20;

    // Age preference match
    const lf = me.lookingFor || {};
    const ageMin = lf.ageMin || 18;
    const ageMax = lf.ageMax || 99;
    if (them.age >= ageMin && them.age <= ageMax) score += 10;

    // Gender preference match
    const wantedGenders = lf.genders || [];
    if (
      wantedGenders.length === 0 ||
      wantedGenders.includes('Everyone') ||
      wantedGenders.some(g => g.toLowerCase() === (them.gender || '').toLowerCase())
    ) {
      score += 10;
    } else {
      // Hard mismatch — return 0 so they don't appear
      return 0;
    }

    // Karma tier similarity (optional soft signal)
    const myTier    = this._karmaTier(me.karma);
    const theirTier = this._karmaTier(them.karma);
    if (myTier === theirTier) score += 5;

    return score;
  },

  _karmaTier(k) {
    if (k > 100000) return 4;
    if (k > 20000)  return 3;
    if (k > 5000)   return 2;
    return 1;
  },

  // Compute what shared things to highlight on the card
  getShared(me, them) {
    const sharedSubs = (me.subreddits || []).filter(s => (them.subreddits || []).includes(s));
    const sharedHobbies = (me.hobbies || []).filter(h => (them.hobbies || []).includes(h));
    return { sharedSubs, sharedHobbies };
  },
};
