import { MenuIcon } from './icons'

const roleTitles = {
  retailer: 'Retailer dashboard',
  dispatcher: 'Dispatch console',
  rider: 'Rider dashboard',
}

function Topbar({ role, onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-lg p-2 -ml-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <h1 className="truncate text-lg font-semibold text-slate-900">
        {roleTitles[role] || 'Dashboard'}
      </h1>
    </header>
  )
}

export default Topbar
