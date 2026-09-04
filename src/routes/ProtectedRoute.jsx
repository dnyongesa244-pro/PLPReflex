import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleHome = {
  RETAILER: '/retailer',
  DISPATCHER: '/dispatcher',
  RIDER: '/rider',
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome[user.role] || '/login'} replace />
  }

  return children
}

export default ProtectedRoute
