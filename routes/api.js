const express = require('express');
const router = express.Router();
const { getGuild, saveGuild } = require('../fileDB');

function requireApiKey(req, res, next){
  const key = req.get('x-api-key') || req.query.api_key;
  if (!key || key !== process.env.API_KEY) return res.status(401).json({ error: 'invalid api key' });
  next();
}

router.get('/guilds', (req, res) => {
  if (req.session?.user?.guilds) return res.json(req.session.user.guilds);
  return res.json([]);
});

router.get('/guilds/:id', (req, res) => {
  const id = req.params.id;
  const g = getGuild(id);
  if (!g) {
    return res.json({ id, prefix: '!', language: 'zh-TW' });
  }
  return res.json(g);
});

router.post('/guilds/:id', requireApiKey, (req, res) => {
  const id = req.params.id;
  const payload = req.body;
  payload.id = id;
  saveGuild(payload);
  res.json({ success: true, guild: payload });
});

router.get('/bot/uptime', (req, res) => {
  const ms = Date.now() - (global.botStartTime || Date.now());
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  res.json({ uptime: `${days} 天 ${hours} 小時 ${minutes} 分 ${seconds} 秒`, ms });
});

module.exports = router;
