import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { usePost } from '../context/PostContext';
import { generateCaptions, regenerateCaption, saveCaption } from '../api/client';
import './GeneratePage.css';

function CaptionCard({ caption, isSelected, sessionId, onSelect, onUpdate }) {
  const [body, setBody] = useState(caption.body);
  const [hashtags] = useState(caption.hashtags);
  const [regenLoading, setRegenLoading] = useState(false);
  const charLimit = 2200;
  const isEdited = body !== caption.body || caption.source === 'edited';

  async function handleRegen() {
    setRegenLoading(true);
    try {
      const updated = await regenerateCaption(sessionId, caption.id);
      setBody(updated.body);
      onUpdate(updated);
    } finally {
      setRegenLoading(false);
    }
  }

  function handleBlur() {
    if (body !== caption.body) {
      const updated = { ...caption, body, charCount: body.length, source: 'edited' };
      saveCaption(sessionId, { captionId: caption.id, body, hashtags, selectedId: isSelected ? caption.id : undefined });
      onUpdate(updated);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(body + '\n\n' + hashtags.join(' '));
  }

  return (
    <div className={`caption-card${isSelected ? ' selected' : ''}`}>
      <div className="caption-header">
        <div className="caption-label">Cap {caption.label}</div>
        <div className={`caption-badge${isEdited ? ' edited' : ''}`}>{isEdited ? 'Edited' : 'AI generated'}</div>
        <div className="caption-actions">
          <button className="caption-action-btn" onClick={handleCopy}>📋 Copy</button>
          <button className="caption-action-btn" onClick={handleRegen} disabled={regenLoading}>
            {regenLoading ? '…' : '↺ Regenerate'}
          </button>
        </div>
      </div>

      <textarea
        className="caption-textarea"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onBlur={handleBlur}
        maxLength={charLimit}
      />
      <div className={`char-row${body.length > 1800 ? ' warn' : ''}`}>
        {body.length} / {charLimit}
      </div>

      <div className="hashtag-row">
        {hashtags.map((tag) => <span key={tag} className="hashtag">{tag}</span>)}
        <span className="hashtag-add">+ Add</span>
      </div>

      <div className="select-row">
        <input
          type="radio"
          id={`sel-${caption.id}`}
          name="selectedCaption"
          checked={isSelected}
          onChange={() => onSelect(caption.id)}
        />
        <label htmlFor={`sel-${caption.id}`}>Use Caption {caption.label}</label>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  const navigate = useNavigate();
  const { state, dispatch } = usePost();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!state.sessionId) { navigate('/'); return; }
    if (state.captions.length === 0) {
      setLoading(true);
      generateCaptions(state.sessionId)
        .then((data) => dispatch({ type: 'SET_CAPTIONS', captions: data.captions }))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, []);

  async function handleRegenAll() {
    setLoading(true);
    try {
      const data = await generateCaptions(state.sessionId);
      dispatch({ type: 'SET_CAPTIONS', captions: data.captions });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    navigate('/platforms');
  }

  const toneLabel = { casual: 'Casual', professional: 'Professional', playful: 'Playful', inspirational: 'Inspirational', minimalist: 'Minimalist' };

  return (
    <PageShell>
      <div className="page-heading">Generated captions</div>
      <div className="page-sub">Review, edit, or regenerate. Select the version you want to post.</div>

      {state.image && (
        <div className="source-row">
          <div className="source-thumb">
            {state.image.previewUrl
              ? <img src={state.image.previewUrl} alt="source" />
              : '🖼️'}
          </div>
          <div className="source-info">
            <div className="source-name">{state.image.originalName || state.settings.topic || 'Topic'}</div>
            <div className="source-meta">{toneLabel[state.settings.tone]} · {state.settings.captionCount} caption(s)</div>
          </div>
          <div className="source-change" onClick={() => navigate('/')}>← Change</div>
        </div>
      )}

      {loading && (
        <div className="ai-loader">
          <div className="loader-dots">
            <div className="loader-dot" />
            <div className="loader-dot" />
            <div className="loader-dot" />
          </div>
          <div className="loader-text">AI is writing your captions…</div>
        </div>
      )}

      {!loading && error && <div style={{ color: '#e24b4a', fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {!loading && state.captions.map((cap) => (
        <CaptionCard
          key={cap.id}
          caption={cap}
          isSelected={state.selectedCaptionId === cap.id}
          sessionId={state.sessionId}
          onSelect={(id) => dispatch({ type: 'SELECT_CAPTION', captionId: id })}
          onUpdate={(updated) => dispatch({ type: 'UPDATE_CAPTION', caption: updated })}
        />
      ))}

      <div className="actions">
        <button className="btn-ghost" onClick={() => navigate('/')}>← Back</button>
        <button className="btn-ghost" onClick={handleRegenAll} disabled={loading}>↺ Regenerate all</button>
        <button className="btn-primary" onClick={handleContinue} disabled={!state.selectedCaptionId}>
          Choose platform →
        </button>
      </div>
    </PageShell>
  );
}
