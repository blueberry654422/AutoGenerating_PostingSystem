import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { usePost } from '../context/PostContext';
import { uploadImage } from '../api/client';
import './UploadPage.css';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_BYTES = 10 * 1024 * 1024;

function formatBytes(b) {
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { dispatch } = usePost();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ topic: '', tone: 'casual', language: 'en', captionCount: '2' });

  function handleFile(f) {
    setError('');
    if (!ALLOWED_TYPES.includes(f.type)) { setError('Only PNG, JPG, WEBP, or GIF files are allowed.'); return; }
    if (f.size > MAX_BYTES) { setError('File must be under 10 MB.'); return; }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function onDrop(e) {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function removeFile() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleGenerate() {
    if (!file && !form.topic.trim()) { setError('Please upload an image or enter a topic.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      if (file) fd.append('image', file);
      fd.append('topic', form.topic);
      fd.append('tone', form.tone);
      fd.append('language', form.language);
      fd.append('captionCount', form.captionCount);

      const data = await uploadImage(fd);
      dispatch({ type: 'SET_SESSION', sessionId: data.sessionId, image: data.image, settings: data.settings });
      navigate('/generate');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    removeFile();
    setForm({ topic: '', tone: 'casual', language: 'en', captionCount: '2' });
    setError('');
  }

  return (
    <PageShell>
      <div className="page-heading">Add your content</div>
      <div className="page-sub">Upload an image or describe your topic — AI will write the captions for you.</div>

      {!file ? (
        <div
          className={`upload-zone${isDragging ? ' drag' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <div className="upload-ico">📷</div>
          <div className="upload-title">Drop your image here</div>
          <div className="upload-sub">Drag & drop, or click to browse your files</div>
          <button className="upload-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            ↑ Browse files
          </button>
          <div className="file-types">PNG, JPG, WEBP, GIF · up to 10 MB</div>
        </div>
      ) : (
        <div className="preview-strip">
          {previewUrl
            ? <img src={previewUrl} alt="preview" className="preview-thumb" />
            : <div className="preview-thumb-icon">🖼️</div>
          }
          <div className="preview-info">
            <div className="preview-name">{file.name}</div>
            <div className="preview-size">{formatBytes(file.size)} · Ready to use</div>
          </div>
          <div className="preview-remove" onClick={removeFile}>✕ Remove</div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
      />

      <div className="divider">
        <div className="divider-line" />
        or enter a topic instead
        <div className="divider-line" />
      </div>

      <div className="field">
        <label className="field-label">Topic / description</label>
        <input
          className="field-input"
          placeholder="e.g. New café opening in KL, minimalist branding, warm morning vibes…"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label">Tone</label>
          <select className="field-select" value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}>
            <option value="casual">Casual & friendly</option>
            <option value="professional">Professional</option>
            <option value="playful">Playful & fun</option>
            <option value="inspirational">Inspirational</option>
            <option value="minimalist">Minimalist</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">Language</label>
          <select className="field-select" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
            <option value="en">English</option>
            <option value="ms">Bahasa Malaysia</option>
            <option value="zh-hans">Chinese (Simplified)</option>
            <option value="zh-hant">Chinese (Traditional)</option>
            <option value="bilingual">Bilingual</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Number of captions</label>
        <select className="field-select" value={form.captionCount} onChange={(e) => setForm({ ...form, captionCount: e.target.value })}>
          <option value="1">1 caption</option>
          <option value="2">2 captions (A/B)</option>
          <option value="3">3 captions (A/B/C)</option>
        </select>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="tip-box">
        <div className="tip-icon">💡</div>
        <div className="tip-text">
          <strong>Tips for better captions:</strong> Add specific details like location, mood, or offer. The more context you give, the more relevant and engaging your captions will be.
        </div>
      </div>

      <div className="actions">
        <button className="btn-ghost" onClick={handleClear}>Clear</button>
        <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Uploading…' : '✨ Generate captions'}
        </button>
      </div>
    </PageShell>
  );
}
