import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogoutIcon } from './icons'

function ProfileMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.name || 'User'
  const role = user?.role || 'User'
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex shrink-0 items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="truncate text-sm font-medium text-slate-900">
          {displayName}
        </p>
        <p className="truncate text-xs text-slate-500">{roleLabel}</p>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
        {initials}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        aria-label="Log out"
        title="Log out"
        className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <LogoutIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

export default ProfileMenu
