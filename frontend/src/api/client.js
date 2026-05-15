async function request(method, path, body, isFormData = false) {
  const opts = { method, headers: {} };
  if (body) {
    if (isFormData) {
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }
  const res = await fetch(path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export function uploadImage(formData) {
  return request('POST', '/api/upload', formData, true);
}

export function generateCaptions(sessionId) {
  return request('POST', '/api/captions/generate', { sessionId });
}

export function regenerateCaption(sessionId, captionId) {
  return request('POST', '/api/captions/regenerate', { sessionId, captionId });
}

export function saveCaption(sessionId, data) {
  return request('PATCH', `/api/captions/${sessionId}`, data);
}

export function selectPlatforms(sessionId, platforms) {
  return request('POST', '/api/platforms', { sessionId, platforms });
}

export function submitSchedule(sessionId, scheduleData) {
  return request('POST', '/api/schedule', { sessionId, ...scheduleData });
}

export function getHistory() {
  return request('GET', '/api/posts');
}
