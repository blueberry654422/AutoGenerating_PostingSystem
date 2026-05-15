const express = require('express');
const router = express.Router();
const { listPosts } = require('../store/inMemoryStore');

router.get('/', (req, res) => {
  const posts = listPosts().map((p) => ({
    postId: p.id,
    title: p.title,
    platforms: p.platforms,
    createdAt: p.createdAt,
    overallStatus: p.results.every((r) => r.status === 'posted')
      ? 'posted'
      : p.results.some((r) => r.status === 'posted')
      ? 'partial'
      : 'pending',
  }));
  res.json({ posts });
});

module.exports = router;
