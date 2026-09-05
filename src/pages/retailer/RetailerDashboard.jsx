import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
  const [searchParams] = useSearchParams()
  const deliveriesRef = useRef(null)

  const statusFilter = searchParams.get('status') || 'ALL'

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

  const matchesStatus = (delivery, status) => {
    if (status === 'PENDING') return delivery.status === 'PENDING'
    if (status === 'IN_TRANSIT')
      return ['ASSIGNED', 'PICKED_UP'].includes(delivery.status)
    if (status === 'COMPLETED')
      return delivery.status === 'DELIVERED' || delivery.confirmed
    return true
  }

  const pendingCount = deliveries.filter((d) =>
    matchesStatus(d, 'PENDING')
  ).length
  const inTransitCount = deliveries.filter((d) =>
    matchesStatus(d, 'IN_TRANSIT')
  ).length
  const completedCount = deliveries.filter((d) =>
    matchesStatus(d, 'COMPLETED')
  ).length

  const filteredDeliveries = deliveries.filter((d) =>
    matchesStatus(d, statusFilter)
  )

  const statusCopy = {
    PENDING: {
      heading: 'Pending deliveries',
      empty: 'No pending deliveries right now.',
    },
    IN_TRANSIT: {
      heading: 'In transit deliveries',
      empty: 'Nothing is currently in transit.',
    },
    COMPLETED: {
      heading: 'Completed deliveries',
      empty: 'No completed deliveries yet.',
    },
    ALL: {
      heading: 'My Deliveries',
      empty: 'No deliveries yet. Create your first request above.',
    },
  }

  // Jump to the deliveries list whenever a stat-card link changes the filter.
  useEffect(() => {
    if (statusFilter !== 'ALL') {
      deliveriesRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [statusFilter])

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
          <Link
            to="?status=PENDING"
            aria-current={statusFilter === 'PENDING' ? 'true' : undefined}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${
              statusFilter === 'PENDING'
                ? 'border-amber-400 ring-2 ring-amber-400/40'
                : 'border-slate-200'
            }`}
          >
            <p className="text-sm font-medium text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {pendingCount}
            </p>
            <p className="mt-1 text-sm text-slate-500">Awaiting assignment</p>
          </Link>

          <Link
            to="?status=IN_TRANSIT"
            aria-current={statusFilter === 'IN_TRANSIT' ? 'true' : undefined}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${
              statusFilter === 'IN_TRANSIT'
                ? 'border-amber-400 ring-2 ring-amber-400/40'
                : 'border-slate-200'
            }`}
          >
            <p className="text-sm font-medium text-slate-500">In Transit</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {inTransitCount}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Currently being delivered
            </p>
          </Link>

          <Link
            to="?status=COMPLETED"
            aria-current={statusFilter === 'COMPLETED' ? 'true' : undefined}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${
              statusFilter === 'COMPLETED'
                ? 'border-amber-400 ring-2 ring-amber-400/40'
                : 'border-slate-200'
            }`}
          >
            <p className="text-sm font-medium text-slate-500">Completed</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {completedCount}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Successfully delivered
            </p>
          </Link>
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

        <div
          ref={deliveriesRef}
          className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {statusCopy[statusFilter].heading}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Track status and share the confirmation code with the rider.
              </p>
            </div>

            {statusFilter !== 'ALL' && (
              <Link
                to="?"
                className="text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
              >
                Show all
              </Link>
            )}
          </div>

          {listLoading && (
            <p className="mt-6 text-sm text-slate-500">Loading deliveries...</p>
          )}

          {!listLoading && filteredDeliveries.length === 0 && (
            <div className="mt-6 rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              {statusCopy[statusFilter].empty}
            </div>
          )}

          {!listLoading && filteredDeliveries.length > 0 && (
            <div className="mt-6 space-y-4">
              {filteredDeliveries.map((delivery) => {
                const badgeStyles = delivery.confirmed
                  ? 'bg-emerald-100 text-emerald-700'
                  : delivery.status === 'PENDING'
                    ? 'bg-slate-100 text-slate-700'
                    : delivery.status === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'

                return (
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
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${badgeStyles}`}
                      >
                        {delivery.confirmed ? 'CONFIRMED' : delivery.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 md:grid-cols-3">
                      <p>
                        <span className="font-medium text-slate-500">
                          Address:
                        </span>{' '}
                        {delivery.delivery_address}
                      </p>
                      <p>
                        <span className="font-medium text-slate-500">Rider:</span>{' '}
                        {delivery.rider_name || 'Unassigned'}
                      </p>
                      <p>
                        <span className="font-medium text-slate-500">
                          QR code:
                        </span>{' '}
                        {delivery.confirmation_code}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default RetailerDashboard
