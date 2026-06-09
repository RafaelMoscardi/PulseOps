interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function Header({ user }: HeaderProps) {
  const displayName = user.name ?? user.email ?? 'Usuário'
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (user.email?.[0] ?? 'U').toUpperCase()

  return (
    <header
      className="h-13 border-b flex items-center justify-between px-5 shrink-0"
      style={{
        background: 'var(--c-surface)',
        borderColor: 'var(--c-border)',
        height: '52px',
      }}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ background: 'var(--c-online)' }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{
              background: 'var(--c-online)',
              boxShadow: '0 0 6px rgba(34,211,238,0.8)',
            }}
          />
        </span>
        <span
          className="text-xs font-medium tracking-wide"
          style={{ color: 'var(--c-muted)' }}
        >
          SISTEMA OPERACIONAL
        </span>
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5">
        <span
          className="text-sm hidden sm:block"
          style={{ color: 'var(--c-muted)' }}
        >
          {displayName}
        </span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold select-none"
          style={{
            background: 'var(--c-accent)',
            fontFamily: 'var(--font-ibm-mono)',
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
