import { useState, useMemo } from 'react'
import LeftColumn from './components/LeftColumn.jsx'
import MiddleColumn from './components/MiddleColumn.jsx'
import RightColumn from './components/RightColumn.jsx'
import { DOMAINS } from './lib/config.js'
import { runPayload, getRequest, executeDB2Query, isEmptyResult } from './lib/api.js'
import {
  genLegalEntity,
  genOrgAssignment,
  genFacilityHierarchy,
  genFacilityMaster,
  genKarma,
  genMna,
  genNshn,
  randDigits,
} from './lib/generators.js'

// Try to find an EUID-like token in an arbitrary server response.
function extractEuid(raw) {
  if (!raw) return null
  const m =
    raw.match(/"?EUID"?\s*[:=]\s*"?(\d{5,})"?/i) ||
    raw.match(/\bEUID[^0-9]{0,6}(\d{5,})/i)
  return m ? m[1] : null
}

export default function App() {
  const [env, setEnv] = useState('dev')
  const [domain, setDomain] = useState('legalEntity')
  const [subToggles, setSubToggles] = useState({})
  const [prefix, setPrefix] = useState('None/Standard')

  const [payload, setPayload] = useState('')
  const [generating, setGenerating] = useState(false)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const [storedIds, setStoredIds] = useState({ legalId: null, facilityId: null })
  const [e2e, setE2e] = useState({ loading: false, log: '' })

  const setSubToggle = (dom, val) =>
    setSubToggles((prev) => ({ ...prev, [dom]: val }))

  const currentSub = (dom) =>
    subToggles[dom] || DOMAINS[dom].subToggles?.options?.[0]

  // ---- uniqueness pre-validation via DB2 -------------------------------
  // Loops random ids until the DB2 query returns no rows. Falls back to a
  // random id (with a note) if the backend is unreachable.
  async function uniqueId({ digits, adminSysTp, appendLog }) {
    let attempts = 0
    while (attempts < 8) {
      attempts++
      const candidate = randDigits(digits)
      const query = `Select * from MDM.CONTEQUIV Where ADMIN_SYS_TP_CD = '${adminSysTp}' and ADMIN_CLIENT_ID = '${candidate}'`
      try {
        const resp = await executeDB2Query({ env, query })
        appendLog?.(`  DB2 check ${candidate}: ${resp.status} → ${isEmptyResult(resp) ? 'unique' : 'exists, retry'}`)
        if (isEmptyResult(resp)) return { id: candidate, verified: true }
      } catch (err) {
        appendLog?.(`  DB2 unreachable (${String(err).slice(0, 60)}); using ${candidate} unverified`)
        return { id: candidate, verified: false }
      }
    }
    return { id: randDigits(digits), verified: false }
  }

  // ---- generation ------------------------------------------------------
  async function buildPayload(logLines) {
    const log = (m) => logLines?.push(m)
    switch (domain) {
      case 'legalEntity': {
        const { id } = await uniqueId({ digits: 6, adminSysTp: '100010', appendLog: log })
        const obj = genLegalEntity({ subToggle: currentSub('legalEntity'), legalId: id })
        setStoredIds((p) => ({ ...p, legalId: id }))
        return { text: JSON.stringify(obj, null, 2), format: 'json' }
      }
      case 'orgAssignment': {
        const obj = genOrgAssignment({ subToggle: currentSub('orgAssignment') })
        return { text: JSON.stringify(obj, null, 2), format: 'json' }
      }
      case 'facilityHierarchy': {
        const { id } = await uniqueId({ digits: 5, adminSysTp: '100011', appendLog: log })
        const obj = genFacilityHierarchy({ subToggle: currentSub('facilityHierarchy'), facilityId: id })
        setStoredIds((p) => ({ ...p, facilityId: id }))
        return { text: JSON.stringify(obj, null, 2), format: 'json' }
      }
      case 'facilityMaster': {
        const obj = genFacilityMaster({
          subToggle: currentSub('facilityMaster'),
          prefix,
          facilityId: storedIds.facilityId,
          legalId: storedIds.legalId,
        })
        return { text: JSON.stringify(obj, null, 2), format: 'json' }
      }
      case 'karma':
        return { text: JSON.stringify(genKarma(), null, 2), format: 'json' }
      case 'mna':
        return { text: genMna(), format: 'xml' }
      case 'nshn':
        return { text: genNshn(), format: 'xml' }
      default:
        return { text: '', format: 'json' }
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setResult(null)
    setError(null)
    try {
      const { text } = await buildPayload()
      setPayload(text)
    } catch (err) {
      setError(String(err))
    } finally {
      setGenerating(false)
    }
  }

  // ---- run POST --------------------------------------------------------
  const handleRun = async () => {
    setRunning(true)
    setResult(null)
    setError(null)
    const def = DOMAINS[domain]
    try {
      const res = await runPayload({
        base: def.base,
        env,
        path: def.path,
        body: payload,
        format: def.format,
      })
      setResult(res)
    } catch (err) {
      setError(`${err}\n\n(Is the Vite dev proxy running & the ${env} backend reachable?)`)
    } finally {
      setRunning(false)
    }
  }

  // ---- end to end ------------------------------------------------------
  const handleEndToEnd = async () => {
    const lines = []
    const flush = () => setE2e({ loading: true, log: lines.join('\n') })
    setE2e({ loading: true, log: 'Starting E2E validation…' })
    const def = DOMAINS[domain]
    try {
      lines.push(`[1/4] Generating ${def.label} payload…`)
      flush()
      const built = await buildPayload(lines)
      setPayload(built.text)
      lines.push('[2/4] Posting payload…')
      flush()

      let euid = null
      try {
        const res = await runPayload({
          base: def.base,
          env,
          path: def.path,
          body: built.text,
          format: def.format,
        })
        setResult(res)
        lines.push(`      POST → ${res.status} ${res.statusText}`)
        euid = extractEuid(res.raw)
        lines.push(euid ? `      Extracted EUID: ${euid}` : '      No EUID in response')
      } catch (err) {
        lines.push(`      POST failed: ${err}`)
      }
      flush()

      lines.push('[3/4] Querying preprocess queue…')
      flush()
      try {
        const pre = await getRequest({
          base: 'kafka',
          env,
          path: '/data/topic/mdm.facilities.preprocess/count/10',
        })
        const found = euid && pre.raw?.includes(euid)
        lines.push(`      preprocess → ${pre.status} ${found ? '(EUID matched ✓)' : ''}`)
      } catch (err) {
        lines.push(`      preprocess failed: ${err}`)
      }
      flush()

      lines.push('[4/4] Querying event queue…')
      flush()
      try {
        const evt = await getRequest({
          base: 'kafka',
          env,
          path: '/data/topic/mdm.facilities.events/count/2',
        })
        const found = euid && evt.raw?.includes(euid)
        lines.push(`      events → ${evt.status} ${found ? '(EUID matched ✓)' : ''}`)
      } catch (err) {
        lines.push(`      events failed: ${err}`)
      }
      lines.push('Done.')
      setE2e({ loading: false, log: lines.join('\n') })
    } catch (err) {
      lines.push(`E2E error: ${err}`)
      setE2e({ loading: false, log: lines.join('\n') })
    }
  }

  const header = useMemo(
    () => (
      <header className="flex items-center justify-between border-b border-edge px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-bold text-white">
            M
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">MDM Location Data Generator</h1>
            <p className="text-xs text-slate-500">
              DaVita Location Master Data Management · synthetic QA payloads
            </p>
          </div>
        </div>
        <span className="rounded-full border border-edge bg-panelalt px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent">
          {env}
        </span>
      </header>
    ),
    [env],
  )

  return (
    <div className="flex h-screen flex-col bg-panelalt text-slate-200">
      {header}
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.4fr)_minmax(300px,1fr)]">
        <LeftColumn
          env={env}
          setEnv={setEnv}
          domain={domain}
          setDomain={setDomain}
          subToggles={subToggles}
          setSubToggle={setSubToggle}
          prefix={prefix}
          setPrefix={setPrefix}
          storedIds={storedIds}
        />
        <MiddleColumn
          domain={domain}
          payload={payload}
          setPayload={setPayload}
          onGenerate={handleGenerate}
          onRun={handleRun}
          generating={generating}
          running={running}
          result={result}
          error={error}
        />
        <RightColumn env={env} storedIds={storedIds} onEndToEnd={handleEndToEnd} e2e={e2e} />
      </main>
    </div>
  )
}
