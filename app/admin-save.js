const OVERRIDE_KEYS = [
  'bentofolio.preview',
  'bentofolio.cv.featured',
  'bentofolio.import',
  'bentofolio.photo',
  'bentofolio.cms',
]

export async function saveConfigToDisk(config, fetchImpl = fetch) {
  try {
    const res = await fetchImpl('/api/admin/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config, null, 2),
    })
    const payload = await res.json().catch(() => null)
    if (payload === null) {
      return { ok: false, error: 'Server response is not valid JSON' }
    }
    if (!res.ok || payload.ok !== true) {
      return { ok: false, error: payload.error || `HTTP ${res.status || 'error'}` }
    }
    return payload
  } catch (err) {
    return { ok: false, error: err?.message || String(err) }
  }
}

export function clearAdminSaveOverrides(storage) {
  if (!storage || typeof storage.removeItem !== 'function') return
  for (const key of OVERRIDE_KEYS) {
    try { storage.removeItem(key) } catch {}
  }
}
