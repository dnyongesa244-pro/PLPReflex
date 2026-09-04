import { NavLink } from 'react-router-dom'
import ProfileMenu from './ProfileMenu'

const roleNavigation = {
  retailer: [
    { label: 'Dashboard', path: '/retailer' },
  ],
  dispatcher: [
    { label: 'Dashboard', path: '/dispatcher' },
  ],
  rider: [
    { label: 'Dashboard', path: '/rider' },
  ],
}

function Sidebar({ role }) {
  const navigation = roleNavigation[role] || []

  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-white md:w-64 md:border-r md:border-b-0">
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 sm:px-6">
        <span className="text-xl font-bold text-slate-900">Reflex</span>
        <div className="md:hidden">
          <ProfileMenu />
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto p-2 sm:p-4 md:block md:space-y-1 md:space-x-0">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              `block shrink-0 rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
