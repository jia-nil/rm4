// pages/flow.js — 3 steps: Reddit fetch + AI bio → profile details → preferences

const FlowPage = {
  _step: 0,
  _redditData: null,
  _profile: {},

  // Called from hero page with the entered username
  async start(username) {
    App.showPage('flow');
    this._profile = { username };
    this._renderShell();
    await this._runStep1(username);
  },

  _renderShell() {
    document.getElementById('page-flow').innerHTML = `
      <div class="flow-wrap">
        <div class="flow-progress" id="flow-progress">
          <div class="fp-step active" data-s="1"><span>1</span> Fetch Reddit</div>
          <div class="fp-line"></div>
          <div class="fp-step" data-s="2"><span>2</span> Your Profile</div>
          <div class="fp-line"></div>
          <div class="fp-step" data-s="3"><span>3</span> Preferences</div>
        </div>
        <div class="flow-card" id="flow-card"></div>
      </div>
    `;
  },

  _setStep(n) {
    this._step = n;
    document.querySelectorAll('.fp-step').forEach(el => {
      const s = +el.dataset.s;
      el.classList.toggle('active', s === n);
      el.classList.toggle('done',   s <  n);
    });
  },

  // ── STEP 1: Fetch Reddit data + AI bio ────────────────────────
  async _runStep1(username) {
    this._setStep(1);
    const card = document.getElementById('flow-card');
    card.innerHTML = `
      <div class="fc-title">Reading your Reddit history</div>
      <div class="fc-sub">Fetching public data from Reddit and generating your bio with AI…</div>
      <div class="fetch-log" id="fetch-log">
        <div class="fl-row" id="fl-reddit">
          <div class="fl-spinner spinner"></div>
          <span>Fetching Reddit profile for u/${esc(username)}…</span>
        </div>
        <div class="fl-row pending" id="fl-ai">
          <div class="fl-dot"></div>
          <span>Generating AI bio from your activity…</span>
        </div>
      </div>
      <div id="fetch-error" class="fetch-error" style="display:none"></div>
    `;

    // Step 1a: Reddit API
    let redditData;
    try {
      redditData = await Reddit.fetch(username);
      this._redditData = redditData;

      document.getElementById('fl-reddit').innerHTML = `
        <div class="fl-check">✓</div>
        <span>Loaded u/${esc(redditData.username)} · ${formatKarma(redditData.karma)} karma · ${formatAccountAge(redditData.accountAgeDays)} old account · ${redditData.topSubs.length} subreddits</span>
      `;
      document.getElementById('fl-ai').classList.remove('pending');
      document.getElementById('fl-ai').innerHTML = `
        <div class="fl-spinner spinner"></div>
        <span>Writing bio from your Reddit activity…</span>
      `;
    } catch (err) {
      document.getElementById('fl-reddit').innerHTML = `
        <div class="fl-x">✗</div>
        <span style="color:var(--red)">${esc(err.message)}</span>
      `;
      const errEl = document.getElementById('fetch-error');
      errEl.style.display = 'block';
      errEl.innerHTML = `
        <strong>Couldn't load Reddit data.</strong> Check the username and try again.<br/>
        <button class="err-back-btn" onclick="App.goHome()">← Try a different username</button>
      `;
      return;
    }

    // Step 1b: AI bio
    let bio = '';
    try {
      bio = await AI.generateBio(redditData);
      document.getElementById('fl-ai').innerHTML = `
        <div class="fl-check">✓</div>
        <span>Bio generated from your Reddit personality</span>
      `;
    } catch (err) {
      document.getElementById('fl-ai').innerHTML = `
        <div class="fl-x">✗</div>
        <span style="color:var(--muted)">AI bio failed (${esc(err.message)}) — you can write one manually</span>
      `;
      bio = '';
    }

    this._profile = {
      username:        redditData.username,
      karma:           redditData.karma,
      accountAgeDays:  redditData.accountAgeDays,
      subreddits:      redditData.topSubs,
      color:           avatarColor(redditData.username),
      bio,
      hobbies:         [],
      age:             '',
      gender:          '',
      intent:          '',
      lookingFor:      { genders: [], ageMin: 18, ageMax: 45, desc: '' },
    };

    // Short pause so user sees the success state, then move on
    await new Promise(r => setTimeout(r, 700));
    this._renderStep2();
  },

  // ── STEP 2: Bio edit + age/gender/hobbies/intent ─────────────
  _renderStep2() {
    this._setStep(2);
    const p    = this._profile;
    const card = document.getElementById('flow-card');

    card.innerHTML = `
      <div class="fc-title">Your profile</div>
      <div class="fc-sub">We've filled in what we could. Edit anything — especially the bio.</div>

      <!-- Reddit summary strip -->
      <div class="reddit-strip">
        <div class="rs-av" style="background:${p.color}">${p.username[0].toUpperCase()}</div>
        <div class="rs-info">
          <div class="rs-name">u/${esc(p.username)}</div>
          <div class="rs-meta">⬆️ ${formatKarma(p.karma)} karma · 🎂 ${formatAccountAge(p.accountAgeDays)} old · 📌 ${p.subreddits.length} communities</div>
        </div>
      </div>

      <!-- Bio -->
      <div class="form-field">
        <div class="ff-bar">
          <label class="ff-label">Bio</label>
          <button class="regen-btn" id="regen-btn" onclick="FlowPage._regenBio()">✨ Regenerate with AI</button>
        </div>
        <div class="regen-loading" id="regen-loading" style="display:none">
          <div class="spinner"></div> Rewriting bio…
        </div>
        <textarea id="f-bio" class="f-textarea" maxlength="300" placeholder="Tell people who you are…">${esc(p.bio)}</textarea>
        <div class="ff-count"><span id="bio-count">${p.bio.length}</span>/300</div>
      </div>

      <!-- Age + Gender -->
      <div class="form-row-2">
        <div class="form-field">
          <label class="ff-label">Your Age</label>
          <input type="number" id="f-age" class="f-input" min="18" max="99" placeholder="e.g. 25" value="${esc(p.age)}"/>
          <div class="ff-err" id="e-age" style="display:none">Must be 18+</div>
        </div>
        <div class="form-field">
          <label class="ff-label">Gender</label>
          <select id="f-gender" class="f-input">
            <option value="">Select…</option>
            ${GENDERS.map(g => `<option value="${g}" ${p.gender === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
          <div class="ff-err" id="e-gender" style="display:none">Please select</div>
        </div>
      </div>

      <!-- Hobbies -->
      <div class="form-field">
        <label class="ff-label">Hobbies <span class="ff-hint">(pick at least 2)</span></label>
        <div class="hobby-chips" id="hobby-chips">
          ${HOBBIES.map(h => `<div class="hchip ${p.hobbies.includes(h) ? 'sel' : ''}" data-h="${h}">${h}</div>`).join('')}
        </div>
        <div class="ff-err" id="e-hobbies" style="display:none">Pick at least 2</div>
      </div>

      <!-- Intent -->
      <div class="form-field">
        <label class="ff-label">What are you here for?</label>
        <div class="intent-grid">
          ${INTENTS.map(i => `
            <div class="intent-card ${p.intent === i.id ? 'sel' : ''}" data-intent="${i.id}">
              <span class="ic-icon">${i.icon}</span>
              <span class="ic-label">${i.label}</span>
              <span class="ic-sub">${i.sub}</span>
            </div>`).join('')}
        </div>
        <div class="ff-err" id="e-intent" style="display:none">Please pick one</div>
      </div>

      <button class="submit-btn" onclick="FlowPage._submitStep2()">Continue →</button>
    `;

    // Bio char counter
    document.getElementById('f-bio').addEventListener('input', function () {
      document.getElementById('bio-count').textContent = this.value.length;
    });

    // Hobby chip toggle
    document.querySelectorAll('.hchip').forEach(el => {
      el.addEventListener('click', function () {
        this.classList.toggle('sel');
      });
    });

    // Intent card toggle
    document.querySelectorAll('.intent-card').forEach(el => {
      el.addEventListener('click', function () {
        document.querySelectorAll('.intent-card').forEach(e => e.classList.remove('sel'));
        this.classList.add('sel');
      });
    });
  },

  async _regenBio() {
    const btn     = document.getElementById('regen-btn');
    const loading = document.getElementById('regen-loading');
    const ta      = document.getElementById('f-bio');
    if (!ta) return;
    btn.disabled = true;
    loading.style.display = 'flex';
    ta.style.opacity = '0.4';
    try {
      const bio = await AI.generateBio(this._redditData);
      ta.value = bio;
      document.getElementById('bio-count').textContent = bio.length;
    } catch (e) {
      // silently fail, user keeps existing bio
    }
    loading.style.display = 'none';
    ta.style.opacity = '1';
    btn.disabled = false;
  },

  _submitStep2() {
    const age    = document.getElementById('f-age').value;
    const gender = document.getElementById('f-gender').value;
    const bio    = document.getElementById('f-bio').value.trim();
    const hobbies = [...document.querySelectorAll('.hchip.sel')].map(el => el.dataset.h);
    const intentEl = document.querySelector('.intent-card.sel');
    const intent  = intentEl?.dataset.intent || '';

    let ok = true;
    if (!age || +age < 18 || +age > 99) { showErr('e-age');    ok = false; } else hideErr('e-age');
    if (!gender)                         { showErr('e-gender'); ok = false; } else hideErr('e-gender');
    if (hobbies.length < 2)              { showErr('e-hobbies','Pick at least 2'); ok = false; } else hideErr('e-hobbies');
    if (!intent)                         { showErr('e-intent', 'Please pick one'); ok = false; } else hideErr('e-intent');
    if (!ok) return;

    this._profile = { ...this._profile, age: +age, gender, bio, hobbies, intent };
    this._renderStep3();
  },

  // ── STEP 3: What they're looking for ─────────────────────────
  _renderStep3() {
    this._setStep(3);
    const p    = this._profile;
    const lf   = p.lookingFor;
    const card = document.getElementById('flow-card');

    card.innerHTML = `
      <div class="fc-title">Who are you looking for?</div>
      <div class="fc-sub">Tell us what you want. Be broad or specific — up to you.</div>

      <div class="form-field">
        <label class="ff-label">Gender <span class="ff-hint">(multi-select)</span></label>
        <div class="gender-chips">
          ${['Man','Woman','Non-binary','Everyone'].map(g =>
            `<div class="gchip ${lf.genders.includes(g) ? 'sel' : ''}" data-g="${g}">${g}</div>`
          ).join('')}
        </div>
        <div class="ff-err" id="e-lgender" style="display:none">Select at least one</div>
      </div>

      <div class="form-row-2">
        <div class="form-field">
          <label class="ff-label">Min Age</label>
          <input type="number" id="f-amin" class="f-input" min="18" max="80" value="${lf.ageMin}" placeholder="18"/>
        </div>
        <div class="form-field">
          <label class="ff-label">Max Age</label>
          <input type="number" id="f-amax" class="f-input" min="18" max="99" value="${lf.ageMax}" placeholder="45"/>
        </div>
      </div>
      <div class="ff-err" id="e-agerange" style="display:none">Check age range</div>

      <div class="form-field">
        <label class="ff-label">Describe your ideal match <span class="ff-hint">(optional)</span></label>
        <textarea id="f-desc" class="f-textarea" maxlength="200" placeholder="Someone who posts in r/books at midnight and has opinions on pineapple pizza…">${esc(lf.desc)}</textarea>
        <div class="ff-count"><span id="desc-count">${lf.desc.length}</span>/200</div>
      </div>

      <div class="ff-err" id="e-save" style="display:none"></div>

      <button class="submit-btn" id="save-btn" onclick="FlowPage._submitStep3()">
        Find My Matches →
      </button>
      <button class="back-btn" onclick="FlowPage._renderStep2()">← Back</button>
    `;

    document.getElementById('f-desc').addEventListener('input', function () {
      document.getElementById('desc-count').textContent = this.value.length;
    });

    document.querySelectorAll('.gchip').forEach(el => {
      el.addEventListener('click', function () {
        const g = this.dataset.g;
        if (g === 'Everyone') {
          document.querySelectorAll('.gchip').forEach(e => e.classList.toggle('sel', e.dataset.g === 'Everyone'));
          return;
        }
        document.querySelectorAll('.gchip[data-g="Everyone"]').forEach(e => e.classList.remove('sel'));
        this.classList.toggle('sel');
      });
    });
  },

  async _submitStep3() {
    const genders  = [...document.querySelectorAll('.gchip.sel')].map(el => el.dataset.g);
    const ageMin   = +document.getElementById('f-amin').value;
    const ageMax   = +document.getElementById('f-amax').value;
    const desc     = document.getElementById('f-desc').value.trim();
    const btn      = document.getElementById('save-btn');

    let ok = true;
    if (!genders.length)              { showErr('e-lgender', 'Select at least one'); ok = false; } else hideErr('e-lgender');
    if (!ageMin || ageMin < 18 || !ageMax || ageMax < ageMin) { showErr('e-agerange', 'Check age range'); ok = false; } else hideErr('e-agerange');
    if (!ok) return;

    this._profile.lookingFor = { genders, ageMin, ageMax, desc };

    btn.disabled   = true;
    btn.textContent = 'Saving & finding matches…';

    try {
      const saved   = await DB.saveProfile(this._profile);
      const others  = await DB.getOthers(saved.username);
      const ranked  = Match.rank(saved, others);
      ResultsPage.render(saved, ranked);
    } catch (err) {
      btn.disabled   = false;
      btn.textContent = 'Find My Matches →';
      showErr('e-save', '⚠️ ' + err.message + ' — check your Supabase config in js/config.js');
    }
  },
};
