const { v4: uuidv4 } = require('uuid');

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function mockPost(platform) {
  await delay(200 + Math.random() * 300);
  const id = uuidv4().replace(/-/g, '').slice(0, 8);
  if (platform === 'xhs') {
    return { platform, status: 'pending', requiresConfirm: true, postUrl: null };
  }
  if (platform === 'ig') {
    return { platform, status: 'posted', requiresConfirm: false, postUrl: `https://instagram.com/p/mock_${id}` };
  }
  if (platform === 'fb') {
    return { platform, status: 'posted', requiresConfirm: false, postUrl: `https://facebook.com/posts/mock_${id}` };
  }
  return { platform, status: 'failed', requiresConfirm: false, postUrl: null };
}

async function postToAllPlatforms(platforms) {
  return Promise.all(platforms.map((p) => mockPost(p)));
}

module.exports = { postToAllPlatforms };
