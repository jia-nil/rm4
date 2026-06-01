// pages/results.js — shows matched profiles from Supabase

const ResultsPage = {

  render(me, matches) {
    App.showPage('results');
    App.setUser(me);

    const el = document.getElementById('page-results');

    el.innerHTML = `
      <div class="results-wrap">
        <div class="results-header">
          <div class="rh-left">
            <div class="rh-av" style="background:${me.color}">${me.username[0].toUpperCase()}</div>
            <div>
              <div class="rh-name">u/${esc(me.username)}</div>
              <div class="rh-meta">${me.age} · ${cap(me.gender)} · ${INTENTS.find(i=>i.id===me.intent)?.icon||''} ${cap(me.intent)}</div>
            </div>
          </div>
          <div class="rh-count">
            ${matches.length > 0
              ? `<strong>${matches.length}</strong> match${matches.length !== 1 ? 'es' : ''} found`
              : 'No matches yet'}
          </div>
        </div>

        ${matches.length === 0 ? this._emptyState() : ''}
        <div class="results-grid" id="results-grid"></div>
      </div>
    `;

    if (matches.length > 0) this._renderCards(me, matches);
  },

  _renderCards(me, matches) {
    const grid = document.getElementById('results-grid');
    grid.innerHTML = '';

    matches.forEach((p, i) => {
      const { sharedSubs, sharedHobbies } = Match.getShared(me, p);
      const iInfo = INTENTS.find(x => x.id === p.intent);
      const card  = document.createElement('div');
      card.className = 'rcard';
      card.style.animationDelay = (i * 0.06) + 's';

      card.innerHTML = `
        <div class="rcard-top">
          <div class="rcard-av" style="background:${p.color}">${p.username[0].toUpperCase()}</div>
          <div class="rcard-info">
            <div class="rcard-name">u/${esc(p.username)}</div>
            <div class="rcard-meta">${p.age} · ${cap(p.gender)} · ${iInfo?.icon||''} ${iInfo?.label||''}</div>
            <div class="rcard-karma">⬆️ ${formatKarma(p.karma)} karma · 🎂 ${formatAccountAge(p.accountAgeDays)}</div>
          </div>
          <div class="rcard-score">${p.score}%</div>
        </div>

        ${p.bio ? `<div class="rcard-bio">"${esc(p.bio)}"</div>` : ''}

        ${sharedSubs.length > 0 ? `
          <div class="rcard-shared">
            <div class="shared-label">📌 ${sharedSubs.length} shared subreddit${sharedSubs.length > 1 ? 's' : ''}</div>
            <div class="shared-chips">
              ${sharedSubs.slice(0, 4).map(s => `<span class="schip sub">${s}</span>`).join('')}
              ${sharedSubs.length > 4 ? `<span class="schip more">+${sharedSubs.length - 4}</span>` : ''}
            </div>
          </div>` : ''}

        ${sharedHobbies.length > 0 ? `
          <div class="rcard-shared">
            <div class="shared-label">❤️ ${sharedHobbies.length} shared interest${sharedHobbies.length > 1 ? 's' : ''}</div>
            <div class="shared-chips">
              ${sharedHobbies.slice(0, 4).map(h => `<span class="schip hobby">${h}</span>`).join('')}
            </div>
          </div>` : ''}

        ${p.lookingFor?.desc ? `
          <div class="rcard-lf">
            <span class="lf-label">Looking for:</span> ${esc(p.lookingFor.desc)}
          </div>` : ''}

        <a class="rcard-connect"
           href="https://reddit.com/user/${encodeURIComponent(p.username)}"
           target="_blank" rel="noopener noreferrer">
          💬 View u/${esc(p.username)} on Reddit & DM them
        </a>
        <div class="rcard-note">Head to their Reddit profile and send a DM to say hi.</div>
      `;

      grid.appendChild(card);
    });
  },

  _emptyState() {
    return `
      <div class="empty-state">
        <div class="es-icon">🌱</div>
        <div class="es-title">No matches yet</div>
        <p class="es-sub">Your profile is saved. You'll appear in other people's results. Share the link with friends to grow the pool!</p>
        <div class="es-url">
          <code id="site-url">${window.location.origin}</code>
          <button onclick="navigator.clipboard.writeText(window.location.origin).then(()=>this.textContent='Copied!').catch(()=>{})" class="copy-btn">Copy link</button>
        </div>
      </div>
    `;
  },
};
