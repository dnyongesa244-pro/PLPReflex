import ProfileMenu from './ProfileMenu'

function Topbar() {

  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
      </div>

      <div className="hidden md:block">
        <ProfileMenu />
      </div>
    </header>
  )
}

export default Topbar
