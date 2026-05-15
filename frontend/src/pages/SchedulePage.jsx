import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { usePost } from '../context/PostContext';
import { submitSchedule } from '../api/client';
import './SchedulePage.css';

const PLATFORM_META = {
  xhs: { name: 'Xiaohongshu', icon: '📕', autoPost: false },
  ig:  { name: 'Instagram',   icon: '📸', autoPost: true  },
  fb:  { name: 'Facebook',    icon: '📘', autoPost: true  },
};

const BEST_TIMES = {
  xhs: ['10:00 AM', '12:30 PM', '08:00 PM'],
  ig:  ['09:00 AM', '12:00 PM', '07:00 PM'],
  fb:  ['11:00 AM', '01:00 PM', '06:00 PM'],
};

const ENGAGEMENT = ['High · 94%', 'Medium · 78%', 'Good · 81%'];

export default function SchedulePage() {
  const navigate = useNavigate();
  const { state, dispatch } = usePost();
  const [mode, setMode] = useState('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timezone, setTimezone] = useState('UTC+8 (KL)');
  const [bestTimes, setBestTimes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (!state.sessionId) navigate('/'); }, []);

  function toggleBestTime(platform, time) {
    setBestTimes((prev) => ({ ...prev, [platform]: time }));
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const schedulePayload = {
        mode,
        scheduledAt: mode === 'scheduled' ? `${scheduledDate}T${scheduledTime}:00+08:00` : null,
        bestTimes: mode === 'best-time' ? bestTimes : {},
      };
      const data = await submitSchedule(state.sessionId, schedulePayload);
      dispatch({ type: 'SET_SCHEDULE', schedule: schedulePayload });
      dispatch({ type: 'SET_POST_RESULT', postResult: data });
      navigate('/done');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedCaption = state.captions.find((c) => c.id === state.selectedCaptionId);

  return (
    <PageShell>
      <div className="page-heading">When to post</div>
      <div className="page-sub">Choose when your content goes live across selected platforms.</div>

      <div className="mode-tabs">
        {[['now', '⚡ Post now'], ['scheduled', '📅 Schedule'], ['best-time', '🤖 Best time (AI)']].map(([val, label]) => (
          <div key={val} className={`mode-tab${mode === val ? ' active' : ''}`} onClick={() => setMode(val)}>
            {label}
          </div>
        ))}
      </div>

      {mode === 'now' && (
        <div className="mode-panel">
          {state.platforms.map((p) => {
            const meta = PLATFORM_META[p] || { name: p, icon: '🌐', autoPost: false };
            return (
              <div key={p} className="platform-status-row">
                <div className="platform-status-name">{meta.icon} {meta.name}</div>
                <div className={`status-pill ${meta.autoPost ? 'auto' : 'confirm'}`}>
                  {meta.autoPost ? 'Auto-post' : 'Needs confirm'}
                </div>
              </div>
            );
          })}
          {state.platforms.includes('xhs') && (
            <div className="info-box amber">
              ⚠️ XHS requires you to confirm the post manually inside the app after submitting.
            </div>
          )}
        </div>
      )}

      {mode === 'scheduled' && (
        <div className="mode-panel">
          <div className="schedule-fields">
            <div className="field">
              <label className="field-label">Date</label>
              <input type="date" className="field-input" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Time</label>
              <input type="time" className="field-input" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Timezone</label>
              <input type="text" className="field-input" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            </div>
          </div>
          {state.platforms.map((p) => {
            const meta = PLATFORM_META[p] || { name: p, icon: '🌐', autoPost: false };
            return (
              <div key={p} className="platform-status-row" style={{ marginTop: 12 }}>
                <div className="platform-status-name">{meta.icon} {meta.name}</div>
                <div className={`status-pill ${meta.autoPost ? 'auto' : 'confirm'}`}>
                  {meta.autoPost ? 'Auto-post' : 'Needs confirm'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mode === 'best-time' && (
        <div className="mode-panel">
          <div className="info-box blue" style={{ marginBottom: 14 }}>
            🤖 AI analyzed your audience engagement patterns and recommends these times.
          </div>
          {state.platforms.map((p) => {
            const meta = PLATFORM_META[p] || { name: p, icon: '🌐' };
            const times = BEST_TIMES[p] || ['10:00 AM', '02:00 PM', '07:00 PM'];
            return (
              <div key={p} className="best-time-card">
                <div className="best-time-platform">{meta.icon} {meta.name}</div>
                <div className="best-time-options">
                  {times.map((t, i) => (
                    <div
                      key={t}
                      className={`best-time-option${bestTimes[p] === t ? ' selected' : ''}`}
                      onClick={() => toggleBestTime(p, t)}
                    >
                      <div className="time">{t}</div>
                      <div className="score">{ENGAGEMENT[i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCaption && (
        <div className="post-summary">
          <div className="post-summary-row">
            <strong>Caption:</strong> {selectedCaption.body.slice(0, 80)}{selectedCaption.body.length > 80 ? '…' : ''}
          </div>
          <div className="post-summary-row">
            <strong>Platforms:</strong> {state.platforms.map((p) => PLATFORM_META[p]?.name || p).join(', ')}
          </div>
          <div className="post-summary-row">
            <strong>Mode:</strong> {mode === 'now' ? 'Post immediately' : mode === 'scheduled' ? `Scheduled – ${scheduledDate} ${scheduledTime}` : 'AI best time'}
          </div>
        </div>
      )}

      {error && <div style={{ color: '#e24b4a', fontSize: 13, marginBottom: 8 }}>{error}</div>}

      <div className="actions">
        <button className="btn-ghost" onClick={() => navigate('/platforms')}>← Back</button>
        <button className="btn-primary" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Posting…' : '✅ Confirm & post'}
        </button>
      </div>
    </PageShell>
  );
}
