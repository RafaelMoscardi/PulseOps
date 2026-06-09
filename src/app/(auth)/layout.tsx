export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'var(--c-bg)',
        backgroundImage: 'radial-gradient(circle, #1a2638 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--c-accent)' }}
            >
              <span
                className="text-white text-sm font-bold"
                style={{ fontFamily: 'var(--font-ibm-mono)' }}
              >
                P
              </span>
            </div>
            <span
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-ibm-mono)' }}
            >
              <span style={{ color: 'var(--c-accent)' }}>PULSE</span>
              <span style={{ color: 'var(--c-text)' }}>OPS</span>
            </span>
          </div>
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: 'var(--c-muted)' }}
          >
            Monitoring Platform
          </p>
        </div>

        {children}
      </div>
    </div>
  )
}
