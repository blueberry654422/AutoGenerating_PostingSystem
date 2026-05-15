const express = require('express');
const router = express.Router();
const { getSession, updateSession } = require('../store/inMemoryStore');
const { adaptForPlatform } = require('../mock/captionGenerator');

router.post('/', (req, res) => {
  const { sessionId, platforms } = req.body;
  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const platformCaptions = {};
  for (const p of platforms) {
    const adapted = adaptForPlatform(session, p);
    if (adapted) platformCaptions[p] = adapted;
  }

  updateSession(sessionId, { platforms, platformCaptions });
  res.json({ platformCaptions });
});

module.exports = router;
