import { NavLink } from 'react-router-dom'

const roleNavigation = {
  retailer: [
    { label: 'Dashboard', path: '/retailer' },
    { label: 'New Delivery', path: '/retailer/deliveries/new' },
    { label: 'My Deliveries', path: '/retailer/deliveries' },
  ],

  dispatcher: [
    { label: 'Dashboard', path: '/dispatcher' },
    { label: 'Delivery Requests', path: '/dispatcher/requests' },
    { label: 'Riders', path: '/dispatcher/riders' },
    { label: 'Assignments', path: '/dispatcher/assignments' },
  ],

  rider: [
    { label: 'Dashboard', path: '/rider' },
    { label: 'My Deliveries', path: '/rider/deliveries' },
    { label: 'QR Confirmation', path: '/rider/confirmation' },
  ],
}

function Sidebar({ role }) {
  const navigation = roleNavigation[role] || []

  return (
    <aside className="w-64 border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <span className="text-xl font-bold text-slate-900">Reflex</span>
      </div>

      <nav className="space-y-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-sm font-medium transition ${
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