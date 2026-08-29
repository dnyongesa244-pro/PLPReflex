import DashboardLayout from '../../layouts/DashboardLayout'

function RiderDashboard() {
  return (
    <DashboardLayout role="rider">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Rider Dashboard
        </h2>

        <p className="mt-2 text-slate-600">
          View assigned deliveries and update delivery status.
        </p>
      </div>
    </DashboardLayout>
  )
}

export default RiderDashboard