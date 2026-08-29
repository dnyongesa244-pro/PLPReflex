function Topbar({ role }) {
  const roleName = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : 'User'

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">Demo User</p>
          <p className="text-xs text-slate-500">{roleName}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
          DU
        </div>
      </div>
    </header>
  )
}

export default Topbar