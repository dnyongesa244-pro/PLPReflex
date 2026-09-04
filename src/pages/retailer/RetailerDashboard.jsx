import { useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { createDelivery } from '../../services/deliveryService'

function RetailerDashboard() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    itemDescription: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    try {
      await createDelivery(formData)

      setMessage('Delivery request created successfully.')

      setFormData({
        customerName: '',
        customerPhone: '',
        deliveryAddress: '',
        itemDescription: '',
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="retailer">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Retailer Dashboard
          </h2>

          <p className="mt-2 text-slate-600">
            Create delivery requests and track your deliveries.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              0
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Awaiting assignment
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              In Transit
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              0
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Currently being delivered
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              0
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Successfully delivered
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Create Delivery Request
              {message && (
                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Enter the customer and order details to request a delivery.
            </p>
          </div>



          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="customerName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Customer name
              </label>

              <input
                id="customerName"
                name="customerName"
                type="text"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="e.g. John Kamau"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div>
              <label
                htmlFor="customerPhone"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Customer phone
              </label>

              <input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={handleChange}
                placeholder="e.g. 0712345678"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="deliveryAddress"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Delivery address
              </label>

              <input
                id="deliveryAddress"
                name="deliveryAddress"
                type="text"
                value={formData.deliveryAddress}
                onChange={handleChange}
                placeholder="e.g. Kakamega Town"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="itemDescription"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Item description
              </label>

              <textarea
                id="itemDescription"
                name="itemDescription"
                value={formData.itemDescription}
                onChange={handleChange}
                placeholder="e.g. Samsung Galaxy A15"
                rows="3"
                required
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
               {loading ? 'Creating...' : 'Create Delivery Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default RetailerDashboard