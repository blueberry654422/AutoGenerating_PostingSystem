const { v4: uuidv4 } = require('uuid');

const sessions = new Map();
const posts = new Map();

function createSession() {
  const id = 'sess_' + uuidv4().replace(/-/g, '').slice(0, 12);
  const session = {
    id,
    createdAt: new Date(),
    image: null,
    settings: { topic: '', tone: 'casual', language: 'en', captionCount: 2 },
    captions: [],
    selectedCaptionId: null,
    platforms: [],
    platformCaptions: {},
    schedule: null,
    postId: null,
  };
  sessions.set(id, session);
  return session;
}

function getSession(id) {
  return sessions.get(id) || null;
}

function updateSession(id, patch) {
  const session = sessions.get(id);
  if (!session) return null;
  Object.assign(session, patch);
  return session;
}

function createPost({ sessionId, title, platforms, results, stats }) {
  const id = 'post_' + uuidv4().replace(/-/g, '').slice(0, 12);
  const post = { id, sessionId, title, platforms, results, stats, createdAt: new Date() };
  posts.set(id, post);
  updateSession(sessionId, { postId: id });
  return post;
}

function listPosts() {
  return Array.from(posts.values()).sort((a, b) => b.createdAt - a.createdAt);
}

function purgeStaleSessions() {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  for (const [id, session] of sessions) {
    if (session.createdAt.getTime() < cutoff) sessions.delete(id);
  }
}

module.exports = { createSession, getSession, updateSession, createPost, listPosts, purgeStaleSessions };
