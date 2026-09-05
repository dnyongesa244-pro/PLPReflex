import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function AppShell({ role, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  // Prevent background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!isSidebarOpen) return undefined
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isSidebarOpen])

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar
        role={role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar role={role} onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default AppShell
