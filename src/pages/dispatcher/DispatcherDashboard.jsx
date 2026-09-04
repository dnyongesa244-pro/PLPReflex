import { useEffect, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  getPendingDeliveries,
  assignRider,
} from '../../services/deliveryService'

function DispatcherDashboard() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assigningId, setAssigningId] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadDeliveries = async () => {
      try {
        const data = await getPendingDeliveries()
        setDeliveries(data.deliveries)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadDeliveries()
  }, [])

  const handleAssignRider = async (deliveryId) => {
    setAssigningId(deliveryId)
    setMessage('')
    setError('')

    try {
      await assignRider(deliveryId, 4)

      setMessage(`Delivery #${deliveryId} assigned to Rider #4.`)

      setDeliveries((currentDeliveries) =>
        currentDeliveries.filter(
          (delivery) => delivery.id !== deliveryId
        )
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setAssigningId(null)
    }
  }
  return (
    <DashboardLayout role="dispatcher">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Dispatcher Dashboard
        </h2>

        <p className="mt-2 text-slate-600">
          Manage delivery requests and rider assignments.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Pending Delivery Requests
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Review new requests and assign them to riders.
              </p>
            </div>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
              {deliveries.length} Pending
            </span>
          </div>

          {loading && (
            <p className="mt-6 text-sm text-slate-500">
              Loading delivery requests...
            </p>
          )}

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && deliveries.length === 0 && (
            <div className="mt-6 rounded-lg bg-slate-50 px-4 py-8 text-center">
              {message && (
                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {message}
                </div>
              )}
              <p className="text-sm text-slate-500">
                No pending delivery requests.
              </p>
            </div>
          )}

          {!loading && !error && deliveries.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-4 py-3 font-medium">
                      Customer
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Item
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Address
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {deliveries.map((delivery) => (
                    <tr
                      key={delivery.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900">
                          {delivery.customer_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {delivery.customer_phone}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {delivery.item_description}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {delivery.delivery_address}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                          {delivery.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleAssignRider(delivery.id)}
                          disabled={assigningId === delivery.id}
                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {assigningId === delivery.id ? 'Assigning...' : 'Assign Rider'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DispatcherDashboard