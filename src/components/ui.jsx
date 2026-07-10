// Small shared dark-mode UI primitives.

export function Column({ title, subtitle, children }) {
  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-edge bg-panel/60 shadow-lg">
      <header className="border-b border-edge px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        {children}
      </div>
    </section>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-600">{hint}</span>}
    </label>
  )
}

export function Button({ children, onClick, variant = 'default', disabled, className = '' }) {
  const styles = {
    default: 'bg-panelalt border border-edge text-slate-200 hover:border-accent hover:text-white',
    primary: 'bg-accent text-white hover:bg-blue-500 border border-accent',
    ghost: 'bg-transparent border border-edge text-slate-300 hover:bg-panelalt',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-600',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Segmented({ options, value, onChange, size = 'sm' }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-edge bg-panelalt p-1">
      {options.map((opt) => {
        const active = value === opt
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              size === 'sm' ? 'text-xs' : 'text-sm'
            } ${
              active
                ? 'bg-accent text-white shadow'
                : 'text-slate-400 hover:bg-panel hover:text-slate-200'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-edge bg-panelalt px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-accent ${
        props.className || ''
      }`}
    />
  )
}

// Terminal-style response box with a colored status line.
export function ResponsePanel({ result, error, loading, title = 'Response' }) {
  let statusColor = 'text-slate-500'
  if (error) statusColor = 'text-rose-400'
  else if (result) statusColor = result.ok ? 'text-emerald-400' : 'text-amber-400'

  return (
    <div className="rounded-lg border border-edge bg-black/60 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-edge px-3 py-1.5">
        <span className="text-[11px] uppercase tracking-wide text-slate-500">{title}</span>
        <span className={statusColor}>
          {loading
            ? '… running'
            : error
            ? 'NETWORK ERROR'
            : result
            ? `${result.status} ${result.statusText}`
            : 'idle'}
        </span>
      </div>
      <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words px-3 py-2 text-slate-300">
        {loading
          ? 'Awaiting server response...'
          : error
          ? error
          : result
          ? result.body || '(empty body)'
          : 'No request sent yet.'}
      </pre>
    </div>
  )
}
