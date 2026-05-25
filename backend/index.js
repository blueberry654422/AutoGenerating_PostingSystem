const express = require('express');
const cors = require('cors');
const { purgeStaleSessions } = require('./store/inMemoryStore');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const uploadRoutes = require('./routes/upload');
const captionRoutes = require('./routes/captions');
const platformRoutes = require('./routes/platforms');
const scheduleRoutes = require('./routes/schedule');
const postRoutes = require('./routes/posts');

app.use('/api/upload', uploadRoutes);
app.use('/api/captions', captionRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/posts', postRoutes);

app.use('/upload', uploadRoutes);
app.use('/captions', captionRoutes);
app.use('/platforms', platformRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/posts', postRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

setInterval(purgeStaleSessions, 30 * 60 * 1000);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
