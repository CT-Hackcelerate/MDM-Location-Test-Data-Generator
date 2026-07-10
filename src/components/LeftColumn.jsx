import { Column, Field, Segmented, TextInput } from './ui.jsx'
import { DOMAINS, DOMAIN_ORDER, ENVIRONMENTS, realUrl } from '../lib/config.js'

export default function LeftColumn({
  env,
  setEnv,
  domain,
  setDomain,
  subToggles,
  setSubToggle,
  prefix,
  setPrefix,
  storedIds,
}) {
  const def = DOMAINS[domain]
  const target = realUrl(def.base, env, def.path)

  return (
    <Column title="Data Generator Control" subtitle="Configure the target payload">
      <Field label="Environment" hint="Updates every target URL dynamically">
        <Segmented options={ENVIRONMENTS} value={env} onChange={setEnv} size="md" />
      </Field>

      <Field label="Domain">
        <div className="grid grid-cols-2 gap-1.5">
          {DOMAIN_ORDER.map((key) => {
            const active = domain === key
            return (
              <button
                key={key}
                onClick={() => setDomain(key)}
                className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition-colors ${
                  active
                    ? 'border-accent bg-accent/15 text-white'
                    : 'border-edge bg-panelalt text-slate-300 hover:border-accent/60'
                }`}
              >
                {DOMAINS[key].label}
              </button>
            )
          })}
        </div>
      </Field>

      {def.subToggles && (
        <Field label={def.subToggles.label}>
          <Segmented
            options={def.subToggles.options}
            value={subToggles[domain] || def.subToggles.options[0]}
            onChange={(v) => setSubToggle(domain, v)}
          />
        </Field>
      )}

      {def.prefixes && (
        <Field label="Prefix" hint="Drives facility lifecycle date logic">
          <select
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="w-full rounded-md border border-edge bg-panelalt px-3 py-2 text-sm text-slate-200 outline-none focus:border-accent"
          >
            {def.prefixes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Endpoint URL (target)" hint="Fetched via proxy — never called directly">
        <TextInput readOnly value={target} className="font-mono text-[11px]" />
      </Field>

      <div className="rounded-lg border border-edge bg-panelalt/60 p-3 text-xs">
        <p className="mb-2 font-semibold uppercase tracking-wide text-slate-500">
          Persisted State
        </p>
        <div className="flex flex-col gap-1 font-mono text-slate-300">
          <span>
            Legal Entity ID:{' '}
            <span className={storedIds.legalId ? 'text-emerald-400' : 'text-slate-600'}>
              {storedIds.legalId || 'none'}
            </span>
          </span>
          <span>
            Hierarchy Facility ID:{' '}
            <span className={storedIds.facilityId ? 'text-emerald-400' : 'text-slate-600'}>
              {storedIds.facilityId || 'none'}
            </span>
          </span>
        </div>
      </div>
    </Column>
  )
}
