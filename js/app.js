// app.js — bootstrap and global app controller

const App = {
  _currentUser: null,

  init() {
    HeroPage.render();
  },

  showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + name).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  goHome() {
    this.showPage('hero');
    HeroPage.render();
    document.getElementById('nav-user').style.display = 'none';
  },

  restart() {
    this._currentUser = null;
    this.goHome();
  },

  setUser(profile) {
    this._currentUser = profile;
    const navUser = document.getElementById('nav-user');
    const navUn   = document.getElementById('nav-username');
    if (navUser) navUser.style.display = 'flex';
    if (navUn)   navUn.textContent     = 'u/' + profile.username;
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
