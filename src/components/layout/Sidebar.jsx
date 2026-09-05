import { NavLink } from 'react-router-dom'
import ProfileMenu from './ProfileMenu'
import { CloseIcon, DashboardIcon } from './icons'

const roleNavigation = {
  retailer: [{ label: 'Dashboard', path: '/retailer', icon: DashboardIcon }],
  dispatcher: [{ label: 'Dashboard', path: '/dispatcher', icon: DashboardIcon }],
  rider: [{ label: 'Dashboard', path: '/rider', icon: DashboardIcon }],
}

const roleLabels = {
  retailer: 'Retailer',
  dispatcher: 'Dispatch',
  rider: 'Rider',
}

function Sidebar({ role, isOpen, onClose }) {
  const navigation = roleNavigation[role] || []

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-900 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:z-auto md:w-64 md:shrink-0 md:translate-x-0`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-slate-900">
              R
            </span>
            <div className="leading-tight">
              <p className="text-base font-semibold text-white">Reflex</p>
              <p className="text-xs text-slate-400">{roleLabels[role] || 'Console'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white md:hidden"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'border-amber-500 bg-slate-800 text-white'
                    : 'border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`
              }
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <ProfileMenu />
        </div>
      </aside>
    </>
  )
}

export default Sidebar
