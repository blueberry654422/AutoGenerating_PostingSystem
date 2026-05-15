const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { createSession, getSession } = require('../store/inMemoryStore');

router.post('/', upload.single('image'), (req, res) => {
  const session = createSession();
  const { topic = '', tone = 'casual', language = 'en', captionCount = '2' } = req.body;

  session.settings = { topic, tone, language, captionCount: parseInt(captionCount, 10) || 2 };

  if (req.file) {
    session.image = {
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      sizeBytes: req.file.size,
      mimeType: req.file.mimetype,
    };
  }

  res.status(201).json({
    sessionId: session.id,
    image: session.image
      ? {
          originalName: session.image.originalName,
          sizeBytes: session.image.sizeBytes,
          mimeType: session.image.mimeType,
          previewUrl: `/api/upload/${session.id}/preview`,
        }
      : null,
    settings: session.settings,
  });
});

router.get('/:sessionId/preview', (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session || !session.image) return res.status(404).json({ error: 'Not found' });
  res.setHeader('Content-Type', session.image.mimeType);
  res.send(session.image.buffer);
});

module.exports = router;
