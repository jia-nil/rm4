// utils.js — shared helpers

const AVATAR_COLORS = [
  '#FF4500','#7E53C1','#09B8A0','#0066CC',
  '#E63B9A','#F5A623','#2E7D32','#546E7A',
];

const HOBBIES = [
  'Gaming 🎮','Movies 🎬','Music 🎵','Travel ✈️','Cooking 🍳','Fitness 💪',
  'Reading 📚','Art 🎨','Photography 📷','Anime 🌸','Hiking 🏔️','Tech 💻',
  'Sports ⚽','Fashion 👗','Crypto 🪙','Writing ✍️','Memes 😂','Podcasts 🎙️',
  'Gardening 🌿','Cars 🚗','Science 🔬','Philosophy 🤔','Dogs 🐶','Cats 🐱','Chess ♟️',
];

const INTENTS = [
  { id: 'friends', icon: '🤝', label: 'Friends',   sub: 'Casual connections'  },
  { id: 'dating',  icon: '💕', label: 'Dating',    sub: 'Romantic interest'   },
  { id: 'collab',  icon: '🛠️', label: 'Collab',    sub: 'Projects & ideas'    },
  { id: 'chat',    icon: '💬', label: 'Just Chat', sub: 'Talk about anything'  },
];

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Prefer not to say'];

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : ''; }

function avatarColor(username) {
  let h = 0;
  for (const c of (username || 'x')) h = c.charCodeAt(0) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function formatKarma(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

function formatAccountAge(days) {
  if (!days || days < 1) return 'new';
  if (days < 30)   return `${days}d`;
  if (days < 365)  return `${Math.floor(days / 30)}mo`;
  const y = Math.floor(days / 365);
  return `${y}yr`;
}

function showEl(id)  { const e = document.getElementById(id); if (e) e.style.display = ''; }
function hideEl(id)  { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
function setText(id, t) { const e = document.getElementById(id); if (e) e.textContent = t; }
function setHTML(id, h) { const e = document.getElementById(id); if (e) e.innerHTML = h; }

function showErr(id, msg) {
  const e = document.getElementById(id);
  if (e) { e.textContent = msg || e.dataset.msg || ''; e.style.display = 'block'; }
}
function hideErr(id) {
  const e = document.getElementById(id);
  if (e) e.style.display = 'none';
}
