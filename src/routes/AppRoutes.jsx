import { Routes, Route, Navigate } from 'react-router-dom'

import Login from '../pages/auth/Login'
import RetailerDashboard from '../pages/retailer/RetailerDashboard'
import DispatcherDashboard from '../pages/dispatcher/DispatcherDashboard'
import RiderDashboard from '../pages/rider/RiderDashboard'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/retailer" element={<RetailerDashboard />} />

      <Route path="/dispatcher" element={<DispatcherDashboard />} />

      <Route path="/rider" element={<RiderDashboard />} />

      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes