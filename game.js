// ===== STATE =====
const state = {
  chars: [],
  selectedChar: null,
  editing: {
    name: '',
    face: 'circle',
    skinColor: '#FFD5A8',
    hairColor: '#2c1b0e',
    clothColor: '#6ab0f5',
    fav: 'food',
  },
  town: {
    items: [],
    coins: 80,
    charX: 250,
  },
  walkDir: 0,
  walkTimer: null,
  coinTimer: null,
  speechTimer: null,
  currentShop: null,
};

const FAV_LABELS = {
  food: '🍕たべものすき',
  animals: '🐱どうぶつすき',
  sports: '⚽スポーツすき',
  music: '🎵おんがくすき',
};

const TALK_LINES = {
  food: [
    'おなかすいたなあ〜！',
    'ピザたべたい！',
    'こんなにいいてんきだとバーベキューしたいな',
    'おかしたべていい？',
    'やきそばたべたい！',
  ],
  animals: [
    'ねこちゃんみたいな〜！',
    'いぬってかわいいよね！',
    'あそこになんかいる！きつねかな？',
    'ちょうちょとんでるよ！',
    'ことりのこえきこえる！',
  ],
  sports: [
    'はしりたい！',
    'サッカーしようよ！',
    'きょうはいいてんきでスポーツびよりだね！',
    'もっとはやくあるけるかな〜',
    'うんどうかいたのしみだな！',
  ],
  music: [
    'きょうもいいうたきいてきた！',
    'すきなうたうたっていい？',
    'あのBGMいいよね〜',
    'ピアノならいたいな！',
    'なんかいいかんじのおんがくかかってるね〜',
  ],
};

const SHOP_GREET = {
  machi: ['まいどっ！なにをおかざりする？', 'いらっしゃい！まちをかざろう！', 'どれにしよっかな〜！'],
  conbini: ['いらっしゃいませ！', 'なにかほしいものある？', 'どれもおいしいよ！'],
};

const ITEM_EMOJIS = {
  tree:'🌳', bench:'🪑', flower:'🌸', lamp:'🏮', fountain:'⛲', sign:'🪧',
  icecream:'🍦', juice:'🧃', cake:'🍰', ball:'⚽',
};

// ===== LOAD / SAVE =====
function loadState() {
  try {
    const saved = localStorage.getItem('tomocole');
    if (saved) {
      const data = JSON.parse(saved);
      state.chars = data.chars || [];
      state.town = Object.assign(state.town, data.town || {});
    }
  } catch(e) {}
}

function saveState() {
  localStorage.setItem('tomocole', JSON.stringify({
    chars: state.chars,
    town: state.town,
  }));
}

// ===== SCREENS =====
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');

  if (name === 'collection') renderCollection();
  if (name === 'create') initCreate();
  if (name === 'town') enterTown();
  if (name === 'shop-machi') {
    state.currentShop = 'machi';
    document.getElementById('machi-coin').textContent = state.town.coins;
  }
  if (name === 'shop-conbini') {
    state.currentShop = 'conbini';
    document.getElementById('conbini-coin').textContent = state.town.coins;
  }
}

// ===== COLLECTION =====
function renderCollection() {
  const grid = document.getElementById('char-grid');
  const empty = document.getElementById('empty-msg');
  grid.innerHTML = '';

  if (state.chars.length === 0) {
    empty.classList.add('show');
    return;
  }
  empty.classList.remove('show');

  state.chars.forEach((ch, i) => {
    const card = document.createElement('div');
    card.className = 'char-card';
    card.innerHTML = `
      <div class="char-sprite-lg" id="card-spr-${i}"></div>
      <div class="card-name">${ch.name}</div>
      <div class="card-fav">${FAV_LABELS[ch.fav]}</div>
      <div class="card-btns">
        <button class="btn-walk" onclick="walkWith(${i})">いっしょにさんぽ！</button>
        <button class="btn-del" onclick="deleteChar(${i})">けす</button>
      </div>
    `;
    grid.appendChild(card);
    renderSprite(document.getElementById(`card-spr-${i}`), ch, 'lg');
  });
}

function walkWith(i) {
  state.selectedChar = state.chars[i];
  showScreen('town');
}

function deleteChar(i) {
  if (!confirm(`「${state.chars[i].name}」をけしてもいい？`)) return;
  state.chars.splice(i, 1);
  saveState();
  renderCollection();
}

// ===== CREATE =====
function initCreate() {
  state.editing = {
    name: '',
    face: 'circle',
    skinColor: '#FFD5A8',
    hairColor: '#2c1b0e',
    clothColor: '#6ab0f5',
    fav: 'food',
  };
  document.getElementById('inp-name').value = '';
  // reset active buttons
  document.querySelectorAll('.sel-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.val === state.editing[b.dataset.key]);
  });
  document.querySelectorAll('.color-dot').forEach(b => {
    b.classList.toggle('active', b.dataset.val === state.editing[b.dataset.key]);
  });
  updatePreview();
}

function pick(btn) {
  const key = btn.dataset.key;
  const val = btn.dataset.val;
  state.editing[key] = val;
  // update active class among siblings with same key
  document.querySelectorAll(`[data-key="${key}"]`).forEach(b => {
    b.classList.toggle('active', b.dataset.val === val);
  });
  updatePreview();
}

function updatePreview() {
  state.editing.name = document.getElementById('inp-name').value.trim();
  document.getElementById('preview-name-label').textContent = state.editing.name || '？？？';
  renderSprite(document.getElementById('preview-sprite'), state.editing, 'lg');
}

function saveChar() {
  const name = document.getElementById('inp-name').value.trim();
  if (!name) { showToast('なまえをいれてね！'); return; }
  const ch = { ...state.editing, name, id: Date.now() };
  state.chars.push(ch);
  saveState();
  showToast(`「${name}」をともだちコレクションについか！🎉`);
  showScreen('collection');
}

// ===== SPRITE RENDERER =====
function renderSprite(el, ch, size) {
  if (!el) return;
  el.innerHTML = '';

  const lg = (size === 'lg');
  const scale = lg ? 1 : 0.56;

  const W  = lg ? 100 : 56;
  const H  = lg ? 130 : 72;

  // sizes (designed at lg=100 scale)
  const faceW = 62, faceH = 62;
  const hairW = 68, hairH = 36;
  const bodyW = 54, bodyH = 44;
  const legW = 14, legH = 20;
  const eyeW = 9, eyeH = 9;
  const eyeGap = 20;
  const mouthW = 22, mouthH = 10;
  const cheekW = 12, cheekH = 8;

  const faceTop  = hairH - 12;
  const eyeTop   = faceTop + 20;
  const mouthTop = faceTop + 38;
  const cheekTop = faceTop + 28;
  const bodyTop  = faceTop + faceH - 8;
  const legTop   = bodyTop + bodyH - 2;
  const hairTop  = faceTop - 14;

  const cx = W / 2;

  function div(cls, styles) {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    Object.assign(d.style, styles);
    el.appendChild(d);
    return d;
  }

  el.style.width  = W + 'px';
  el.style.height = H + 'px';
  el.style.position = 'relative';

  // hair
  div('spr-hair', {
    width: hairW+'px', height: hairH+'px',
    background: ch.hairColor,
    top: hairTop+'px',
  });

  // face
  div('spr-face ' + ch.face, {
    width: faceW+'px', height: faceH+'px',
    background: ch.skinColor,
    top: faceTop+'px',
  });

  // cheeks
  const cheeks = document.createElement('div');
  cheeks.className = 'spr-cheeks';
  cheeks.style.cssText = `width:${faceW}px;top:${cheekTop}px;`;
  ['left','right'].forEach(() => {
    const c = document.createElement('div');
    c.className = 'spr-cheek';
    c.style.cssText = `width:${cheekW}px;height:${cheekH}px;`;
    cheeks.appendChild(c);
  });
  el.appendChild(cheeks);

  // eyes
  const eyes = document.createElement('div');
  eyes.className = 'spr-eyes';
  eyes.style.cssText = `width:${faceW-10}px;top:${eyeTop}px;`;
  for (let i=0;i<2;i++){
    const e = document.createElement('div');
    e.className = 'spr-eye';
    e.style.cssText = `width:${eyeW}px;height:${eyeH}px;`;
    eyes.appendChild(e);
  }
  el.appendChild(eyes);

  // mouth
  div('spr-mouth', {
    width: mouthW+'px', height: mouthH+'px',
    top: mouthTop+'px',
  });

  // body
  div('spr-body', {
    width: bodyW+'px', height: bodyH+'px',
    background: ch.clothColor,
    top: bodyTop+'px',
  });

  // legs
  const legs = document.createElement('div');
  legs.className = 'spr-legs';
  legs.style.cssText = `top:${legTop}px;`;
  for (let i=0;i<2;i++){
    const l = document.createElement('div');
    l.className = 'spr-leg';
    l.style.cssText = `width:${legW}px;height:${legH}px;`;
    legs.appendChild(l);
  }
  el.appendChild(legs);
}

// ===== TOWN =====
function enterTown() {
  if (!state.selectedChar) { showScreen('collection'); return; }
  stopWalk();

  document.getElementById('town-char-name').textContent = state.selectedChar.name + 'とさんぽ中🐾';
  document.getElementById('coin-disp').textContent = state.town.coins;

  // render sprite
  const spr = document.getElementById('town-sprite');
  renderSprite(spr, state.selectedChar, 'sm');

  // render ground items
  renderGroundItems();

  // position character
  const charEl = document.getElementById('town-char');
  charEl.style.left = state.town.charX + 'px';

  // start coin gain timer
  clearInterval(state.coinTimer);
  state.coinTimer = setInterval(() => {
    if (state.walkDir !== 0) addCoins(1);
  }, 1000);

  updateCamera();
}

function renderGroundItems() {
  const container = document.getElementById('ground-items');
  container.innerHTML = '';
  state.town.items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'ground-item';
    el.style.left = item.x + 'px';
    el.textContent = ITEM_EMOJIS[item.type] || '❓';
    container.appendChild(el);
  });
}

function updateCamera() {
  const scene = document.getElementById('town-scene');
  const wrap = document.querySelector('.town-wrap');
  if (!scene || !wrap) return;
  const viewW = wrap.offsetWidth || 480;
  const sceneW = 900;
  const charX = state.town.charX;
  let offsetX = charX - viewW / 2;
  offsetX = Math.max(0, Math.min(sceneW - viewW, offsetX));
  scene.style.transform = `translateX(${-offsetX}px)`;
}

function startWalk(dir) {
  state.walkDir = dir;
  const charEl = document.getElementById('town-char');
  if (dir < 0) charEl.classList.add('walk-left');
  else charEl.classList.remove('walk-left');

  clearInterval(state.walkTimer);
  state.walkTimer = setInterval(() => {
    state.town.charX += dir * 4;
    state.town.charX = Math.max(40, Math.min(860, state.town.charX));
    document.getElementById('town-char').style.left = state.town.charX + 'px';
    updateCamera();
  }, 30);
}

function stopWalk() {
  state.walkDir = 0;
  clearInterval(state.walkTimer);
  saveState();
}

function addCoins(n) {
  state.town.coins += n;
  document.getElementById('coin-disp').textContent = state.town.coins;
  saveState();
}

function talk() {
  const ch = state.selectedChar;
  if (!ch) return;

  // check near building
  const charX = state.town.charX;
  const nearMachi   = charX >= 100 && charX <= 280;
  const nearConbini = charX >= 500 && charX <= 680;

  let line;
  if (nearMachi) {
    const lines = SHOP_GREET.machi;
    line = lines[Math.floor(Math.random() * lines.length)];
    setTimeout(() => showScreen('shop-machi'), 1200);
  } else if (nearConbini) {
    const lines = SHOP_GREET.conbini;
    line = lines[Math.floor(Math.random() * lines.length)];
    setTimeout(() => showScreen('shop-conbini'), 1200);
  } else {
    const lines = TALK_LINES[ch.fav];
    line = lines[Math.floor(Math.random() * lines.length)];
  }

  showSpeech(line);
}

function showSpeech(text) {
  clearTimeout(state.speechTimer);
  const bubble = document.getElementById('speech');
  bubble.textContent = text;
  bubble.style.display = 'block';
  state.speechTimer = setTimeout(() => { bubble.style.display = 'none'; }, 3000);
}

// ===== SHOP =====
function enterShop(type) {
  showScreen('shop-' + type);
}

function buyItem(type, price) {
  if (state.town.coins < price) {
    showToast('コインがたりないよ！さんぽしてためよう🪙');
    return;
  }
  state.town.coins -= price;
  saveState();

  // update coin displays
  document.getElementById('coin-disp').textContent = state.town.coins;
  document.getElementById('machi-coin').textContent = state.town.coins;
  document.getElementById('conbini-coin').textContent = state.town.coins;

  if (['tree','bench','flower','lamp','fountain','sign'].includes(type)) {
    // place in town at a spread-out position
    const existing = state.town.items.filter(i => i.type === type).length;
    const x = 60 + (state.town.items.length * 70) % 750;
    state.town.items.push({ type, x });
    saveState();
    showToast(`${ITEM_EMOJIS[type]} まちに${getItemName(type)}をおいたよ！`);
  } else {
    showToast(`${ITEM_EMOJIS[type]} かったよ！ともだちにはなしかけてみて！`);
    // store in selectedChar inventory for next talk
    if (state.selectedChar) {
      state.selectedChar._gift = type;
    }
  }
}

function getItemName(type) {
  const names = { tree:'き', bench:'ベンチ', flower:'はな', lamp:'でんとう', fountain:'ふんすい', sign:'かんばん' };
  return names[type] || type;
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ===== KEYBOARD =====
document.addEventListener('keydown', e => {
  const screen = document.querySelector('.screen.active');
  if (!screen || screen.id !== 'screen-town') return;
  if (e.key === 'ArrowLeft')  startWalk(-1);
  if (e.key === 'ArrowRight') startWalk(1);
  if (e.key === ' ') { e.preventDefault(); talk(); }
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') stopWalk();
});

// ===== INIT =====
loadState();
showScreen('title');
