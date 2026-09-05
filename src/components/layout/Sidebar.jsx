import { Link, useLocation } from 'react-router-dom'
import { CloseIcon, DashboardIcon } from './icons'

const roleNavigation = {
  retailer: [
    { label: 'Dashboard', path: '/retailer', search: '' },
    { label: 'Pending', path: '/retailer', search: '?status=PENDING' },
    { label: 'In Transit', path: '/retailer', search: '?status=IN_TRANSIT' },
    { label: 'Completed', path: '/retailer', search: '?status=COMPLETED' },
  ],
  dispatcher: [
    { label: 'Dashboard', path: '/dispatcher', search: '' },
    { label: 'Pending Requests', path: '/dispatcher', search: '?section=pending' },
    { label: 'Active Assignments', path: '/dispatcher', search: '?section=active' },
    { label: 'Completed', path: '/dispatcher', search: '?section=completed' },
  ],
  rider: [
    { label: 'Dashboard', path: '/rider', search: '' },
    { label: 'Assigned', path: '/rider', search: '?status=ASSIGNED' },
    { label: 'Picked Up', path: '/rider', search: '?status=PICKED_UP' },
    { label: 'Delivered', path: '/rider', search: '?status=DELIVERED' },
  ],
}

const roleLabels = {
  retailer: 'Retailer',
  dispatcher: 'Dispatch',
  rider: 'Rider',
}

function Sidebar({ role, isOpen, onClose }) {
  const navigation = roleNavigation[role] || []
  const location = useLocation()

  const isItemActive = (item) =>
    location.pathname === item.path &&
    (location.search || '') === (item.search || '')

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
          {navigation.map((item, index) => {
            const active = isItemActive(item)
            const isPrimary = index === 0

            return (
              <Link
                key={`${item.path}${item.search}`}
                to={`${item.path}${item.search}`}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg border-l-2 py-2.5 text-sm font-medium transition ${
                  isPrimary ? 'px-3' : 'py-2 pl-9 pr-3'
                } ${
                  active
                    ? 'border-amber-500 bg-slate-800 text-white'
                    : 'border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                {isPrimary && <DashboardIcon className="h-4 w-4 shrink-0" />}
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
