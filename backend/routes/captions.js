const express = require('express');
const router = express.Router();
const { getSession, updateSession } = require('../store/inMemoryStore');
const { generateCaptions, regenerateCaption } = require('../mock/captionGenerator');

router.post('/generate', async (req, res) => {
  const { sessionId } = req.body;
  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const captions = await generateCaptions(session);
  updateSession(sessionId, { captions, selectedCaptionId: captions[0]?.id || null });

  res.json({ sessionId, captions });
});

router.post('/regenerate', async (req, res) => {
  const { sessionId, captionId } = req.body;
  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const updated = await regenerateCaption(session, captionId);
  const captions = session.captions.map((c) => (c.id === captionId ? updated : c));
  updateSession(sessionId, { captions });

  res.json(updated);
});

router.patch('/:sessionId', (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { captionId, body, hashtags, selectedId } = req.body;
  const captions = session.captions.map((c) => {
    if (c.id !== captionId) return c;
    const updated = { ...c, body, hashtags, charCount: body.length, source: 'edited' };
    return updated;
  });

  const patch = { captions };
  if (selectedId) patch.selectedCaptionId = selectedId;
  updateSession(req.params.sessionId, patch);

  const caption = captions.find((c) => c.id === captionId);
  res.json({ ok: true, caption });
});

module.exports = router;
