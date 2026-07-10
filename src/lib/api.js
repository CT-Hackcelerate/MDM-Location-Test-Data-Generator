// -------------------------------------------------------------------------
// Network client — every call routes through the Vite dev proxy.
// -------------------------------------------------------------------------
import { proxyUrl, DB2_QUERY_PATH } from './config.js'

// Normalized result object surfaced to the response panels.
async function toResult(res) {
  const text = await res.text()
  let parsed = text
  try {
    parsed = JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    /* leave as-is (xml / plain text) */
  }
  return { ok: res.ok, status: res.status, statusText: res.statusText, body: parsed, raw: text }
}

export async function runPayload({ base, env, path, body, format }) {
  const url = proxyUrl(base, env, path)
  const contentType = format === 'xml' ? 'text/xml' : 'application/json'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  })
  return toResult(res)
}

export async function getRequest({ base, env, path }) {
  const url = proxyUrl(base, env, path)
  const res = await fetch(url, { method: 'GET' })
  return toResult(res)
}

// Runs the DB2 uniqueness query used by Legal Entity / Facility Hierarchy.
// Returns the parsed JSON response (or throws on network failure).
export async function executeDB2Query({ env, query }) {
  const url = proxyUrl('mdmace', env, DB2_QUERY_PATH)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const text = await res.text()
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) }
  } catch {
    return { ok: res.ok, status: res.status, data: text }
  }
}

// Heuristic: does the DB2 response look "empty" (no rows) => id is unique.
export function isEmptyResult(resp) {
  const d = resp?.data
  if (d == null) return true
  if (Array.isArray(d)) return d.length === 0
  if (typeof d === 'object') {
    const rows = d.rows || d.result || d.data || d.records
    if (Array.isArray(rows)) return rows.length === 0
    return Object.keys(d).length === 0
  }
  if (typeof d === 'string') return d.trim() === '' || /no rows|empty|\[\]/i.test(d)
  return false
}
