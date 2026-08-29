import DashboardLayout from '../../layouts/DashboardLayout'

function DispatcherDashboard() {
  return (
    <DashboardLayout role="dispatcher">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Dispatcher Dashboard
        </h2>

        <p className="mt-2 text-slate-600">
          Manage delivery requests and rider assignments.
        </p>
      </div>
    </DashboardLayout>
  )
}

export default DispatcherDashboard