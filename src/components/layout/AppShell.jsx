import Sidebar from './Sidebar'
import Topbar from './Topbar'

function AppShell({ role, children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={role} />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppShell