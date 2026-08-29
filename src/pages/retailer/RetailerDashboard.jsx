import DashboardLayout from '../../layouts/DashboardLayout'

function RetailerDashboard() {
  return (
    <DashboardLayout role="retailer">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Retailer Dashboard
        </h2>

        <p className="mt-2 text-slate-600">
          Manage your delivery requests and track their status.
        </p>
      </div>
    </DashboardLayout>
  )
}

export default RetailerDashboard