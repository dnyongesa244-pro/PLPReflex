import AppShell from '../components/layout/AppShell'

function DashboardLayout({ role, children }) {
  return <AppShell role={role}>{children}</AppShell>
}

export default DashboardLayout