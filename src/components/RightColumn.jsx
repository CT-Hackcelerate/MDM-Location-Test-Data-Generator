import { useState } from 'react'
import { Column, Field, Button, TextInput, ResponsePanel } from './ui.jsx'
import { getRequest } from '../lib/api.js'

function QueryBlock({ title, hint, euid, setEuid, onQuery, state, buttonLabel = 'Query Queue' }) {
  return (
    <div className="rounded-lg border border-edge bg-panelalt/50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      {hint && <p className="mb-2 text-[11px] text-slate-600">{hint}</p>}
      <Field label="EUID">
        <TextInput
          value={euid}
          onChange={(e) => setEuid(e.target.value)}
          placeholder="Enter EUID"
          className="font-mono"
        />
      </Field>
      <Button
        variant="default"
        onClick={onQuery}
        disabled={state.loading}
        className="mt-2 w-full"
      >
        {state.loading ? 'Querying…' : buttonLabel}
      </Button>
      {state.match && (
        <div className="mt-2 rounded border border-emerald-700/50 bg-emerald-900/20 px-2 py-1 text-[11px] text-emerald-300">
          {state.match}
        </div>
      )}
      {(state.result || state.error || state.loading) && (
        <div className="mt-2">
          <ResponsePanel
            result={state.result}
            error={state.error}
            loading={state.loading}
            title="Queue Result"
          />
        </div>
      )}
    </div>
  )
}

export default function RightColumn({ env, storedIds, onEndToEnd, e2e }) {
  const [preEuid, setPreEuid] = useState('')
  const [evtEuid, setEvtEuid] = useState('')
  const [locEuid, setLocEuid] = useState('')

  const [preState, setPreState] = useState({})
  const [evtState, setEvtState] = useState({})
  const [locState, setLocState] = useState({})

  const runQuery = async (setState, req, euidToMatch) => {
    setState({ loading: true })
    try {
      const result = await getRequest(req)
      // Try to locate the EUID inside the returned list.
      let match = null
      if (euidToMatch && result.raw && result.raw.includes(euidToMatch)) {
        match = `Matched EUID ${euidToMatch} in queue payload ✓`
      } else if (euidToMatch) {
        match = `EUID ${euidToMatch} not found in returned records`
      }
      setState({ loading: false, result, match })
    } catch (err) {
      setState({ loading: false, error: String(err) })
    }
  }

  return (
    <Column title="Data Validation Control" subtitle="Query queues + verify by EUID">
      <div className="rounded-lg border border-accent/40 bg-accent/10 p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
          End to End Validation
        </p>
        <p className="mb-2 text-[11px] text-slate-500">
          Generate → post → extract EUID → query both queues automatically.
        </p>
        <Button variant="primary" onClick={onEndToEnd} disabled={e2e.loading} className="w-full">
          {e2e.loading ? 'Running E2E…' : 'Run End to End'}
        </Button>
        {e2e.log && (
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded border border-edge bg-black/60 p-2 font-mono text-[11px] text-slate-300">
            {e2e.log}
          </pre>
        )}
      </div>

      <QueryBlock
        title="Preprocess Queue"
        hint="GET /data/topic/mdm.facilities.preprocess/count/10"
        euid={preEuid}
        setEuid={setPreEuid}
        state={preState}
        onQuery={() =>
          runQuery(
            setPreState,
            { base: 'kafka', env, path: '/data/topic/mdm.facilities.preprocess/count/10' },
            preEuid,
          )
        }
      />

      <QueryBlock
        title="Event Queue"
        hint="GET /data/topic/mdm.facilities.events/count/2"
        euid={evtEuid}
        setEuid={setEvtEuid}
        buttonLabel="Query"
        state={evtState}
        onQuery={() =>
          runQuery(
            setEvtState,
            { base: 'kafka', env, path: '/data/topic/mdm.facilities.events/count/2' },
            evtEuid,
          )
        }
      />

      <QueryBlock
        title="Query Location By EUID"
        hint="GET /Location/IS01/getLocationDetailsByEUID"
        euid={locEuid}
        setEuid={setLocEuid}
        buttonLabel="Get Location"
        state={locState}
        onQuery={() =>
          runQuery(
            setLocState,
            {
              base: 'mdmace',
              env,
              path: `/Location/IS01/getLocationDetailsByEUID?EUID=${encodeURIComponent(locEuid)}`,
            },
            locEuid,
          )
        }
      />
    </Column>
  )
}
