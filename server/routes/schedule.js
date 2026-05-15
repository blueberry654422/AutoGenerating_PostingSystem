const express = require('express');
const router = express.Router();
const { getSession, updateSession, createPost } = require('../store/inMemoryStore');
const { postToAllPlatforms } = require('../mock/socialPoster');

router.post('/', async (req, res) => {
  const { sessionId, mode, scheduledAt, bestTimes } = req.body;
  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  updateSession(sessionId, { schedule: { mode, scheduledAt: scheduledAt || null, bestTimes: bestTimes || {} } });

  const results = await postToAllPlatforms(session.platforms);
  const selected = session.captions.find((c) => c.id === session.selectedCaptionId) || session.captions[0];
  const hashtagCount = selected ? selected.hashtags.length : 0;
  const charCount = selected ? selected.charCount : 0;
  const now = new Date();
  const timePosted = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const stats = {
    platformCount: session.platforms.length,
    charCount,
    hashtagCount,
    timePosted,
  };

  const post = createPost({
    sessionId,
    title: session.settings.topic || 'Untitled post',
    platforms: session.platforms,
    results,
    stats,
  });

  res.json({ postId: post.id, results, postedAt: now.toISOString(), stats });
});

module.exports = router;
