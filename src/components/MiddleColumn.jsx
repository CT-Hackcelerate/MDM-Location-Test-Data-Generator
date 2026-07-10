import { useState } from 'react'
import { Column, Button, ResponsePanel } from './ui.jsx'
import { DOMAINS } from '../lib/config.js'

export default function MiddleColumn({
  domain,
  payload,
  setPayload,
  onGenerate,
  onRun,
  generating,
  running,
  result,
  error,
}) {
  const def = DOMAINS[domain]
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Column title="Generated Payload" subtitle={`${def.label} · ${def.format.toUpperCase()}`}>
      <Button variant="primary" onClick={onGenerate} disabled={generating} className="w-full">
        {generating ? 'Generating…' : `Generate ${def.label} Payload`}
      </Button>

      <div className="relative flex min-h-[220px] flex-1 flex-col">
        <textarea
          spellCheck={false}
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          placeholder="Click Generate to build a payload — you can edit it here before running."
          className="h-full min-h-[220px] w-full flex-1 resize-none rounded-lg border border-edge bg-black/70 p-3 font-mono text-xs leading-relaxed text-emerald-200/90 outline-none focus:border-accent"
        />
        <span className="absolute right-2 top-2 rounded bg-panelalt px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500">
          {def.format}
        </span>
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" onClick={copy} disabled={!payload} className="flex-1">
          {copied ? '✓ Copied' : 'Copy to Clipboard'}
        </Button>
        <Button
          variant="success"
          onClick={onRun}
          disabled={!payload || running}
          className="flex-1"
        >
          {running ? 'Posting…' : 'Run Payload'}
        </Button>
      </div>

      <ResponsePanel result={result} error={error} loading={running} title="Server Response" />
    </Column>
  )
}
