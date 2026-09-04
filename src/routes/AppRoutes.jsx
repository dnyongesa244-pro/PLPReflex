import { Routes, Route, Navigate } from 'react-router-dom'

import Login from '../pages/auth/Login'
import RetailerDashboard from '../pages/retailer/RetailerDashboard'
import DispatcherDashboard from '../pages/dispatcher/DispatcherDashboard'
import RiderDashboard from '../pages/rider/RiderDashboard'
import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/retailer"
        element={
          <ProtectedRoute allowedRoles={['RETAILER']}>
            <RetailerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dispatcher"
        element={
          <ProtectedRoute allowedRoles={['DISPATCHER']}>
            <DispatcherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rider"
        element={
          <ProtectedRoute allowedRoles={['RIDER']}>
            <RiderDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes