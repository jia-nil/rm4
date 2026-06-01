// pages/hero.js

const HeroPage = {
  render() {
    document.getElementById('page-hero').innerHTML = `
      <div class="hero-wrap">
        <div class="hero-content">
          <div class="hero-badge">Real Reddit data · Real people · No fake profiles</div>
          <h1 class="hero-h1">Find your<br/><span>Reddit</span> match</h1>
          <p class="hero-p">Enter your Reddit username. We read your public history, write your bio with AI, and match you with real Redditors who signed up — based on the communities you both love.</p>

          <div class="username-card">
            <div class="uc-label">Your Reddit username</div>
            <div class="uc-row">
              <div class="uc-prefix">u/</div>
              <input
                type="text"
                id="hero-username"
                class="uc-input"
                placeholder="YourUsername"
                autocomplete="off"
                spellcheck="false"
                onkeydown="if(event.key==='Enter') HeroPage.submit()"
              />
              <button class="uc-btn" id="hero-btn" onclick="HeroPage.submit()">
                Let's go →
              </button>
            </div>
            <div class="uc-error" id="hero-err" style="display:none"></div>
            <div class="uc-note">We only read public data — karma, subreddits, comment history. No passwords. No login.</div>
          </div>
        </div>

        <div class="hero-steps">
          <div class="step-card">
            <div class="step-num">1</div>
            <div class="step-title">We read your Reddit</div>
            <div class="step-desc">Public karma, account age, top subreddits, recent comments</div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-card">
            <div class="step-num">2</div>
            <div class="step-title">AI writes your bio</div>
            <div class="step-desc">OpenRouter AI builds a bio from your actual Reddit personality. You edit it.</div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-card">
            <div class="step-num">3</div>
            <div class="step-title">We find your match</div>
            <div class="step-desc">Searched against real registered users only. No bots, no fake data.</div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step-card">
            <div class="step-num">4</div>
            <div class="step-title">Connect on Reddit</div>
            <div class="step-desc">Get their username, profile, and DM them directly on Reddit.</div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => document.getElementById('hero-username')?.focus(), 100);
  },

  async submit() {
    const input = document.getElementById('hero-username');
    const btn   = document.getElementById('hero-btn');
    const val   = (input?.value || '').trim().replace(/^u\//i, '');

    hideErr('hero-err');

    if (!val || !/^[A-Za-z0-9_-]{3,20}$/.test(val)) {
      showErr('hero-err', 'Enter a valid Reddit username (3–20 chars, letters/numbers/_)');
      return;
    }

    // Hand off to the flow
    btn.disabled   = true;
    btn.textContent = 'Loading…';
    await FlowPage.start(val);
    btn.disabled   = false;
    btn.textContent = 'Let\'s go →';
  },
};
