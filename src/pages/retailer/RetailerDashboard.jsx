import { useEffect, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  createDelivery,
  getRetailerDeliveries,
} from '../../services/deliveryService'
import {
  connectSocket,
  disconnectSocket,
  onDeliveryUpdated,
  offDeliveryUpdated,
} from '../../services/socketService'

function RetailerDashboard() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    itemDescription: '',
  })
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadDeliveries = async () => {
    try {
      const data = await getRetailerDeliveries()
      setDeliveries(data.deliveries || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    loadDeliveries()
  }, [])

  useEffect(() => {
    const handleDeliveryUpdated = (updatedDelivery) => {
      if (!updatedDelivery?.id) return

      setDeliveries((current) => {
        const exists = current.some(
          (delivery) => String(delivery.id) === String(updatedDelivery.id)
        )

        if (!exists) {
          return [updatedDelivery, ...current]
        }

        return current.map((delivery) =>
          String(delivery.id) === String(updatedDelivery.id)
            ? { ...delivery, ...updatedDelivery }
            : delivery
        )
      })
    }

    connectSocket()
    onDeliveryUpdated(handleDeliveryUpdated)

    return () => {
      offDeliveryUpdated(handleDeliveryUpdated)
      disconnectSocket()
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const data = await createDelivery(formData)
      setMessage(
        `Delivery request created. Confirmation code: ${data.delivery.confirmation_code}`
      )
      setFormData({
        customerName: '',
        customerPhone: '',
        deliveryAddress: '',
        itemDescription: '',
      })
      await loadDeliveries()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const pendingCount = deliveries.filter((d) => d.status === 'PENDING').length
  const inTransitCount = deliveries.filter((d) =>
    ['ASSIGNED', 'PICKED_UP'].includes(d.status)
  ).length
  const completedCount = deliveries.filter(
    (d) => d.status === 'DELIVERED' || d.confirmed
  ).length

  return (
    <DashboardLayout role="retailer">
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Retailer Dashboard
          </h2>
          <p className="mt-2 text-slate-600">
            Create delivery requests and track your deliveries.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <p className="text-sm font-medium text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {pendingCount}
            </p>
            <p className="mt-1 text-sm text-slate-500">Awaiting assignment</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <p className="text-sm font-medium text-slate-500">In Transit</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {inTransitCount}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Currently being delivered
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <p className="text-sm font-medium text-slate-500">Completed</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {completedCount}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Successfully delivered
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Create Delivery Request
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Enter the customer and order details to request a delivery.
            </p>
          </div>

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
                className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? 'Creating...' : 'Create Delivery Request'}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            My Deliveries
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Track status and share the confirmation code with the rider.
          </p>

          {listLoading && (
            <p className="mt-6 text-sm text-slate-500">Loading deliveries...</p>
          )}

          {!listLoading && deliveries.length === 0 && (
            <div className="mt-6 rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No deliveries yet. Create your first request above.
            </div>
          )}

          {!listLoading && deliveries.length > 0 && (
            <div className="mt-6 space-y-4">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="rounded-lg border border-slate-200 p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Delivery #{delivery.id}
                      </p>
                      <h4 className="mt-1 text-lg font-semibold text-slate-900">
                        {delivery.customer_name}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {delivery.item_description}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                      {delivery.confirmed ? 'CONFIRMED' : delivery.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 md:grid-cols-3">
                    <p>
                      <span className="font-medium text-slate-500">Address:</span>{' '}
                      {delivery.delivery_address}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">Rider:</span>{' '}
                      {delivery.rider_name || 'Unassigned'}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">QR code:</span>{' '}
                      {delivery.confirmation_code}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default RetailerDashboard
