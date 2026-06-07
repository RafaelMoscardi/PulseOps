export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            <span className="text-indigo-400">Pulse</span>Ops
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Monitore seus serviços, antecipe problemas
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
