import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { usePost } from '../context/PostContext';
import { getHistory } from '../api/client';
import './DonePage.css';

const PLATFORM_META = {
  xhs: { name: 'Xiaohongshu', icon: '📕' },
  ig:  { name: 'Instagram',   icon: '📸' },
  fb:  { name: 'Facebook',    icon: '📘' },
};

export default function DonePage() {
  const navigate = useNavigate();
  const { state, dispatch } = usePost();
  const [history, setHistory] = useState([]);
  const { postResult } = state;

  useEffect(() => {
    if (!state.sessionId) { navigate('/'); return; }
    getHistory().then((d) => setHistory(d.posts)).catch(() => {});
  }, []);

  function handleNewPost() {
    dispatch({ type: 'RESET' });
    navigate('/');
  }

  if (!postResult) return null;

  const { results, stats } = postResult;

  return (
    <PageShell>
      <div className="success-hero">
        <div className="success-icon">✅</div>
        <div className="success-title">Post submitted!</div>
        <div className="success-sub">Your content is on its way. Check the results below.</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.platformCount}</div>
          <div className="stat-label">Platforms</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.timePosted}</div>
          <div className="stat-label">Time posted</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.charCount}</div>
          <div className="stat-label">Characters</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.hashtagCount}</div>
          <div className="stat-label">Hashtags</div>
        </div>
      </div>

      {results.map((r) => {
        const meta = PLATFORM_META[r.platform] || { name: r.platform, icon: '🌐' };
        const pc = state.platformCaptions[r.platform];
        return (
          <div key={r.platform} className="result-card">
            <div className="result-header">
              <div className="result-platform">{meta.icon} {meta.name}</div>
              <div className={`result-status ${r.status}`}>
                {r.status === 'posted' ? '✓ Posted' : r.status === 'pending' ? 'Awaiting confirm' : 'Failed'}
              </div>
            </div>
            {pc && (
              <>
                <div className="result-caption">{pc.body}</div>
                <div className="result-hashtags">
                  {pc.hashtags.map((tag) => <span key={tag} className="result-hashtag">{tag}</span>)}
                </div>
              </>
            )}
            <div className="result-meta">
              <span>{new Date().toLocaleDateString()}</span>
              <span>{stats.timePosted}</span>
              {r.postUrl && <a href={r.postUrl} target="_blank" rel="noreferrer" className="result-link">View post ↗</a>}
            </div>
            {r.requiresConfirm && (
              <div className="result-confirm-note">
                ⚠️ Open Xiaohongshu app to confirm and publish this post.
                <button className="remind-btn">🔔 Remind me</button>
              </div>
            )}
          </div>
        );
      })}

      <div className="cta-row">
        <button className="btn-ghost" onClick={handleNewPost}>+ New post</button>
        <button className="btn-primary">📊 View analytics</button>
      </div>

      {history.length > 0 && (
        <div className="history-section">
          <div className="history-title">Recent posts</div>
          {history.map((p) => (
            <div key={p.postId} className="history-row">
              <div>
                <div className="history-name">{p.title}</div>
                <div className="history-meta">
                  {p.platforms.map((pl) => PLATFORM_META[pl]?.name || pl).join(', ')} · {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className={`history-status ${p.overallStatus}`}>{p.overallStatus}</div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
