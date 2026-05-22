import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { usePost } from '../context/PostContext';
import { getHistory } from '../api/client';
import './DonePage.css';

const PLATFORM_META = {
  xhs: {
    name: 'Xiaohongshu',
    icon: '📕',
    appUrl: 'xhsdiscover://',
    webUrl: 'https://www.xiaohongshu.com/',
  },
  ig:  {
    name: 'Instagram',
    icon: '📸',
    appUrl: 'instagram://camera',
    webUrl: 'https://www.instagram.com/',
  },
  fb:  {
    name: 'Facebook',
    icon: '📘',
    appUrl: 'fb://facewebmodal/f?href=https://www.facebook.com/',
    webUrl: 'https://www.facebook.com/',
  },
};

const isMobileDevice = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function buildPostText(platformCaption) {
  if (!platformCaption) return '';
  const tags = platformCaption.hashtags?.length ? `\n\n${platformCaption.hashtags.join(' ')}` : '';
  return `${platformCaption.body}${tags}`;
}

async function copyText(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_err) {
    return false;
  }
}

export default function DonePage() {
  const navigate = useNavigate();
  const { state, dispatch } = usePost();
  const [history, setHistory] = useState([]);
  const [actionStatus, setActionStatus] = useState({});
  const { postResult } = state;

  useEffect(() => {
    if (!state.sessionId) { navigate('/'); return; }
    getHistory().then((d) => setHistory(d.posts)).catch(() => {});
  }, []);

  function handleNewPost() {
    dispatch({ type: 'RESET' });
    navigate('/');
  }

  async function handleCopy(platform) {
    const copied = await copyText(buildPostText(state.platformCaptions[platform]));
    setActionStatus((prev) => ({
      ...prev,
      [platform]: copied ? 'Caption copied' : 'Copy failed',
    }));
  }

  async function handleCopyAndOpen(platform) {
    const meta = PLATFORM_META[platform] || { name: platform, webUrl: 'https://www.google.com/' };
    const mobile = isMobileDevice();
    const copyPromise = copyText(buildPostText(state.platformCaptions[platform]));

    setActionStatus((prev) => ({
      ...prev,
      [platform]: 'Copying and opening...',
    }));

    if (mobile && meta.appUrl) {
      window.location.href = meta.appUrl;
      window.setTimeout(() => {
        window.open(meta.webUrl, '_blank', 'noopener,noreferrer');
      }, 900);
    } else {
      window.open(meta.webUrl, '_blank', 'noopener,noreferrer');
    }

    const copied = await copyPromise;
    window.setTimeout(() => {
      setActionStatus((prev) => ({
        ...prev,
        [platform]: copied ? 'Copied and opened' : 'Opened. Copy manually',
      }));
    }, 1100);
  }

  if (!postResult) return null;

  const { results, stats } = postResult;

  return (
    <PageShell>
      <div className="success-hero">
        <div className="success-icon">✅</div>
        <div className="success-title">Ready to post</div>
        <div className="success-sub">Copy your caption, open each platform, paste, edit if needed, and publish.</div>
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
              <div className="result-status pending">
                Ready to post
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
            <div className="posting-actions">
              <button className="post-action primary" onClick={() => handleCopyAndOpen(r.platform)}>
                Copy caption & open
              </button>
              <button className="post-action" onClick={() => handleCopy(r.platform)}>
                Copy only
              </button>
              {state.image?.previewUrl && (
                <a className="post-action" href={state.image.previewUrl} target="_blank" rel="noreferrer">
                  Open image
                </a>
              )}
            </div>
            {actionStatus[r.platform] && (
              <div className={`copy-status${actionStatus[r.platform].includes('failed') ? ' error' : ''}`}>
                {actionStatus[r.platform]}
              </div>
            )}
            <div className="result-meta">
              <span>{new Date().toLocaleDateString()}</span>
              <span>{stats.timePosted}</span>
              <a href={meta.webUrl} target="_blank" rel="noreferrer" className="result-link">Open website ↗</a>
            </div>
            {r.platform === 'xhs' && (
              <div className="result-confirm-note">
                ⚠️ Xiaohongshu usually needs manual upload and final confirmation in the app.
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
