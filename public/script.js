/* script.js - frontend logic connecting to backend API */
const API_BASE = (window.API_BASE) ? window.API_BASE : (location.origin + '/api');

const guildSelect = document.getElementById('guild-select');
const guildSettings = document.getElementById('guild-settings');
const epRole = document.getElementById('ep-role');
const dailyEp = document.getElementById('daily-ep');
const saveBtn = document.getElementById('btn-save');
const refreshBtn = document.getElementById('btn-refresh');
const saveMsg = document.getElementById('save-msg');
const botStatusEl = document.getElementById('bot-status');
const botUptimeEl = document.getElementById('bot-uptime');
const guildCountEl = document.getElementById('guild-count');

let guilds = [];

async function loadGuilds() {
  try {
    const res = await fetch(API_BASE + '/guilds', { credentials: 'include' });
    if (!res.ok) throw new Error('no session');
    guilds = await res.json();
  } catch (e) {
    guilds = [];
    console.warn('無法取得伺服器列表，請先登入', e);
  }
  renderGuildList();
}

function renderGuildList() {
  guildSelect.innerHTML = '';
  if (guilds.length === 0) {
    const opt = document.createElement('option'); opt.text = '尚未登入或無伺服器'; guildSelect.add(opt); return;
  }
  guilds.forEach(g => {
    const opt = document.createElement('option'); opt.value = g.id; opt.text = g.name; guildSelect.add(opt);
  });
  guildSelect.addEventListener('change', onGuildChange);
  onGuildChange();
}

async function onGuildChange() {
  const id = guildSelect.value;
  if (!id) return;
  try {
    const res = await fetch(API_BASE + '/guilds/' + id, { credentials: 'include' });
    if (!res.ok) throw new Error('no data');
    const data = await res.json();
    showGuildSettings(data);
  } catch (e) {
    console.error('讀取伺服器設定失敗', e);
    guildSettings.style.display = 'none';
  }
}

function showGuildSettings(data) {
  guildSettings.style.display = 'block';
  epRole.value = data.epRole || 'admin';
  dailyEp.value = data.daily || 3;
  guildCountEl.innerText = guilds.length;
}

async function saveSettings() {
  const id = guildSelect.value;
  if (!id) return;
  const payload = {
    id,
    name: guildSelect.options[guildSelect.selectedIndex].text,
    epRole: epRole.value,
    daily: Number(dailyEp.value)
  };
  try {
    const res = await fetch(API_BASE + '/guilds/' + id, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('save failed');
    saveMsg.style.display = 'block'; saveMsg.innerText = '儲存成功';
    setTimeout(()=> saveMsg.style.display='none', 3000);
  } catch (e) {
    saveMsg.style.display = 'block'; saveMsg.innerText = '儲存失敗，請稍後再試';
  }
}

async function loadBotStatus() {
  try {
    const res = await fetch(API_BASE + '/bot/uptime');
    if (!res.ok) throw new Error('no uptime');
    const j = await res.json();
    botStatusEl.innerText = '線上';
    botUptimeEl.innerText = j.uptime;
  } catch (e) {
    botStatusEl.innerText = '離線';
    botUptimeEl.innerText = '無法取得';
  }
}

saveBtn.addEventListener('click', saveSettings);
refreshBtn.addEventListener('click', ()=>{ onGuildChange(); loadBotStatus(); });

document.querySelectorAll('.tab-button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-button').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

loadGuilds();
loadBotStatus();
setInterval(loadBotStatus, 5000);
