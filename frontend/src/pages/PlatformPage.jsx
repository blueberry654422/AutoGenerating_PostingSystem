import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { usePost } from '../context/PostContext';
import { selectPlatforms } from '../api/client';
import './PlatformPage.css';

const PLATFORMS = [
  { id: 'xhs', name: 'Xiaohongshu', icon: '📕', limit: 'Max 1000 chars · 30 hashtags' },
  { id: 'ig', name: 'Instagram', icon: '📸', limit: 'Max 2200 chars · 30 hashtags' },
  { id: 'fb', name: 'Facebook', icon: '📘', limit: 'Max 63,206 chars' },
];

export default function PlatformPage() {
  const navigate = useNavigate();
  const { state, dispatch } = usePost();
  const [selected, setSelected] = useState(state.platforms.length > 0 ? state.platforms : ['xhs', 'ig']);
  const [activeTab, setActiveTab] = useState(null);
  const [platformCaptions, setPlatformCaptions] = useState(state.platformCaptions || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!state.sessionId) { navigate('/'); return; }
    setActiveTab(selected[0] || null);
  }, []);

  function togglePlatform(id) {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      if (!next.includes(activeTab)) setActiveTab(next[0] || null);
      return next;
    });
  }

  async function handleNext() {
    if (selected.length === 0) { setError('Select at least one platform.'); return; }
    setLoading(true);
    try {
      const data = await selectPlatforms(state.sessionId, selected);
      setPlatformCaptions(data.platformCaptions);
      dispatch({ type: 'SET_PLATFORMS', platforms: selected });
      dispatch({ type: 'SET_PLATFORM_CAPTIONS', platformCaptions: data.platformCaptions });
      navigate('/schedule');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const activeCaption = platformCaptions[activeTab];

  return (
    <PageShell>
      <div className="page-heading">Choose platforms</div>
      <div className="page-sub">Select where you want to post. Captions will be adapted per platform.</div>

      <div className="platform-grid">
        {PLATFORMS.map((p) => (
          <div
            key={p.id}
            className={`platform-card${selected.includes(p.id) ? ' selected' : ''}`}
            onClick={() => togglePlatform(p.id)}
          >
            {selected.includes(p.id) && <div className="platform-check">✓</div>}
            <div className="platform-icon">{p.icon}</div>
            <div className="platform-name">{p.name}</div>
            <div className="platform-limit">{p.limit}</div>
          </div>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="preview-panel">
          <div className="preview-tabs">
            {selected.map((id) => {
              const p = PLATFORMS.find((x) => x.id === id);
              return (
                <div
                  key={id}
                  className={`preview-tab${activeTab === id ? ' active' : ''}`}
                  onClick={() => setActiveTab(id)}
                >
                  {p?.icon} {p?.name}
                </div>
              );
            })}
          </div>
          <div className="preview-content">
            {activeCaption ? (
              <>
                <div className="preview-caption-text">{activeCaption.body}</div>
                <div className="preview-hashtags">
                  {activeCaption.hashtags.map((tag) => <span key={tag} className="preview-hashtag">{tag}</span>)}
                </div>
                {activeCaption.requiresManualConfirm && (
                  <div className="preview-note">⚠️ Xiaohongshu requires manual confirmation in-app after posting.</div>
                )}
                <div className="preview-meta">
                  {activeCaption.charCount} / {activeCaption.charLimit} chars · {activeCaption.postMode}
                </div>
              </>
            ) : (
              <div className="preview-empty">Select a platform to see the adapted caption preview.</div>
            )}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div className="summary-bar">
          Posting to {selected.length} platform{selected.length > 1 ? 's' : ''}: {selected.map((id) => PLATFORMS.find((p) => p.id === id)?.name).join(', ')}
        </div>
      )}

      {error && <div style={{ color: '#e24b4a', fontSize: 13, marginBottom: 8 }}>{error}</div>}

      <div className="actions">
        <button className="btn-ghost" onClick={() => navigate('/generate')}>← Back</button>
        <button className="btn-primary" onClick={handleNext} disabled={loading || selected.length === 0}>
          {loading ? 'Loading…' : 'Next: Schedule →'}
        </button>
      </div>
    </PageShell>
  );
}
