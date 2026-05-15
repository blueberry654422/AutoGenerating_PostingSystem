const express = require('express');
const cors = require('cors');
const { purgeStaleSessions } = require('./store/inMemoryStore');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/upload', require('./routes/upload'));
app.use('/api/captions', require('./routes/captions'));
app.use('/api/platforms', require('./routes/platforms'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/posts', require('./routes/posts'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

setInterval(purgeStaleSessions, 30 * 60 * 1000);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
