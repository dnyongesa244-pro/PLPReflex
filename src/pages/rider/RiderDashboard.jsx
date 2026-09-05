import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  getMyDeliveries,
  updateDeliveryStatus,
  confirmDelivery,
} from '../../services/deliveryService'
import {
  connectSocket,
  disconnectSocket,
  onDeliveryUpdated,
  offDeliveryUpdated,
} from '../../services/socketService'

function RiderDashboard() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [message, setMessage] = useState('')
  const [confirmationCodes, setConfirmationCodes] = useState({})
  const [confirmingId, setConfirmingId] = useState(null)
  const [searchParams] = useSearchParams()
  const statusFilter = searchParams.get('status') || 'ALL'

  const loadDeliveries = async () => {
    try {
      const data = await getMyDeliveries()
      setDeliveries(data.deliveries || [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeliveries()
  }, [])

  useEffect(() => {
    const handleDeliveryUpdated = (updatedDelivery) => {
      if (!updatedDelivery?.id) return

      setDeliveries((currentDeliveries) => {
        const exists = currentDeliveries.some(
          (delivery) => String(delivery.id) === String(updatedDelivery.id)
        )

        if (!exists) {
          if (updatedDelivery.rider_id) {
            return [updatedDelivery, ...currentDeliveries]
          }
          return currentDeliveries
        }

        return currentDeliveries.map((delivery) =>
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

  const handleStatusUpdate = async (deliveryId, status) => {
    setUpdatingId(deliveryId)
    setMessage('')
    setError('')

    try {
      const data = await updateDeliveryStatus(deliveryId, status)
      setMessage(`Delivery #${deliveryId} status updated to ${status}.`)
      setDeliveries((currentDeliveries) =>
        currentDeliveries.map((delivery) =>
          String(delivery.id) === String(deliveryId)
            ? { ...delivery, ...data.delivery }
            : delivery
        )
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleConfirmDelivery = async (deliveryId) => {
    const confirmationCode = confirmationCodes[deliveryId] || ''

    if (!confirmationCode.trim()) {
      setError('Please enter the confirmation code.')
      return
    }

    setConfirmingId(deliveryId)
    setMessage('')
    setError('')

    try {
      const data = await confirmDelivery(deliveryId, confirmationCode)
      setMessage(`Delivery #${deliveryId} confirmed successfully.`)
      setDeliveries((currentDeliveries) =>
        currentDeliveries.map((delivery) =>
          String(delivery.id) === String(deliveryId)
            ? { ...delivery, ...data.delivery, confirmed: true }
            : delivery
        )
      )
      setConfirmationCodes((currentCodes) => {
        const updatedCodes = { ...currentCodes }
        delete updatedCodes[deliveryId]
        return updatedCodes
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setConfirmingId(null)
    }
  }

  const filteredDeliveries = deliveries.filter((delivery) => {
    if (statusFilter === 'ALL') return true
    if (statusFilter === 'DELIVERED') {
      return delivery.status === 'DELIVERED' || delivery.confirmed
    }
    return delivery.status === statusFilter
  })

  const statusCopy = {
    ASSIGNED: {
      heading: 'Assigned deliveries',
      empty: 'No deliveries waiting for pickup.',
    },
    PICKED_UP: {
      heading: 'Picked up deliveries',
      empty: 'Nothing picked up right now.',
    },
    DELIVERED: {
      heading: 'Delivered',
      empty: 'No delivered deliveries yet.',
    },
    ALL: {
      heading: 'My Assigned Deliveries',
      empty: 'No deliveries have been assigned to you.',
    },
  }

  return (
    <DashboardLayout role="rider">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Rider Dashboard</h2>
        <p className="mt-2 text-slate-600">
          View assigned deliveries and update delivery status.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {statusCopy[statusFilter].heading}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Deliveries assigned to you by the dispatcher. Use the retailer
                QR code to confirm.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {statusFilter !== 'ALL' && (
                <Link
                  to="?"
                  className="text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                >
                  Show all
                </Link>
              )}
              <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {filteredDeliveries.length} Deliveries
              </span>
            </div>
          </div>

          {loading && (
            <p className="mt-6 text-sm text-slate-500">
              Loading assigned deliveries...
            </p>
          )}

          {!loading && filteredDeliveries.length === 0 && (
            <div className="mt-6 rounded-lg bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm text-slate-500">
                {statusCopy[statusFilter].empty}
              </p>
            </div>
          )}

          {!loading && filteredDeliveries.length > 0 && (
            <div className="mt-6 space-y-4">
              {filteredDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="rounded-lg border border-slate-200 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Delivery #{delivery.id}
                      </p>
                      <h4 className="mt-1 text-lg font-semibold text-slate-900">
                        {delivery.customer_name}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {delivery.customer_phone}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                      {delivery.confirmed ? 'CONFIRMED' : delivery.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Item
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {delivery.item_description}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Delivery Address
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {delivery.delivery_address}
                      </p>
                    </div>
                  </div>

                  {delivery.status === 'ASSIGNED' && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusUpdate(delivery.id, 'PICKED_UP')
                        }
                        disabled={updatingId === delivery.id}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === delivery.id
                          ? 'Updating...'
                          : 'Mark as Picked Up'}
                      </button>
                    </div>
                  )}

                  {delivery.status === 'PICKED_UP' && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusUpdate(delivery.id, 'DELIVERED')
                        }
                        disabled={updatingId === delivery.id}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === delivery.id
                          ? 'Updating...'
                          : 'Mark as Delivered'}
                      </button>
                    </div>
                  )}

                  {delivery.status === 'DELIVERED' && !delivery.confirmed && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-sm font-medium text-slate-700">
                        Confirm Delivery
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Enter the QR confirmation code from the retailer.
                      </p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={confirmationCodes[delivery.id] || ''}
                          onChange={(event) =>
                            setConfirmationCodes((currentCodes) => ({
                              ...currentCodes,
                              [delivery.id]: event.target.value,
                            }))
                          }
                          placeholder="Enter confirmation code"
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleConfirmDelivery(delivery.id)}
                          disabled={confirmingId === delivery.id}
                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {confirmingId === delivery.id
                            ? 'Confirming...'
                            : 'Confirm Delivery'}
                        </button>
                      </div>
                    </div>
                  )}

                  {delivery.confirmed && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-sm font-medium text-green-700">
                        Delivery Confirmed
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default RiderDashboard
