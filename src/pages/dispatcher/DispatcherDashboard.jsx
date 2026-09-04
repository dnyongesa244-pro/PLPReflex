import { useEffect, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  getPendingDeliveries,
  getAssignedDeliveries,
  getRiders,
  assignRider,
} from '../../services/deliveryService'
import {
  connectSocket,
  disconnectSocket,
  onDeliveryUpdated,
  offDeliveryUpdated,
} from '../../services/socketService'

function DispatcherDashboard() {
  const [deliveries, setDeliveries] = useState([])
  const [assigned, setAssigned] = useState([])
  const [riders, setRiders] = useState([])
  const [selectedRiders, setSelectedRiders] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assigningId, setAssigningId] = useState(null)
  const [message, setMessage] = useState('')
  const [activeSection, setActiveSection] = useState('pending')
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false)

  const loadData = async () => {
    try {
      const [pendingData, assignedData, ridersData] = await Promise.all([
        getPendingDeliveries(),
        getAssignedDeliveries(),
        getRiders(),
      ])

      setDeliveries(pendingData.deliveries || [])
      setAssigned(assignedData.deliveries || [])
      setRiders(ridersData.riders || [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const handleDeliveryUpdated = (updatedDelivery) => {
      if (!updatedDelivery?.id) return

      if (updatedDelivery.status === 'PENDING') {
        setDeliveries((current) => {
          const exists = current.some(
            (d) => String(d.id) === String(updatedDelivery.id)
          )
          if (exists) {
            return current.map((d) =>
              String(d.id) === String(updatedDelivery.id)
                ? { ...d, ...updatedDelivery }
                : d
            )
          }
          return [...current, updatedDelivery]
        })
        setAssigned((current) =>
          current.filter((d) => String(d.id) !== String(updatedDelivery.id))
        )
      } else {
        setDeliveries((current) =>
          current.filter((d) => String(d.id) !== String(updatedDelivery.id))
        )
        setAssigned((current) => {
          const exists = current.some(
            (d) => String(d.id) === String(updatedDelivery.id)
          )
          if (exists) {
            return current.map((d) =>
              String(d.id) === String(updatedDelivery.id)
                ? { ...d, ...updatedDelivery }
                : d
            )
          }
          return [updatedDelivery, ...current]
        })
      }
    }

    connectSocket()
    onDeliveryUpdated(handleDeliveryUpdated)

    return () => {
      offDeliveryUpdated(handleDeliveryUpdated)
      disconnectSocket()
    }
  }, [])

  const handleAssignRider = async (deliveryId) => {
    const riderId = selectedRiders[deliveryId] || riders[0]?.id

    if (!riderId) {
      setError('No riders available. Seed the database first.')
      return
    }

    setAssigningId(deliveryId)
    setMessage('')
    setError('')

    try {
      const data = await assignRider(deliveryId, riderId)
      const riderName = data.delivery.rider_name || `Rider #${riderId}`

      setMessage(`Delivery #${deliveryId} assigned to ${riderName}.`)
      setDeliveries((current) =>
        current.filter((delivery) => String(delivery.id) !== String(deliveryId))
      )
      setAssigned((current) => [data.delivery, ...current])
    } catch (err) {
      setError(err.message)
    } finally {
      setAssigningId(null)
    }
  }

  const activeAssignments = assigned.filter(
    (delivery) => delivery.status !== 'DELIVERED' && !delivery.confirmed
  )
  const completedAssignments = assigned.filter(
    (delivery) => delivery.status === 'DELIVERED' || delivery.confirmed
  )

  const sections = [
    {
      id: 'pending',
      label: 'Pending Delivery Requests',
      count: deliveries.length,
    },
    {
      id: 'active',
      label: 'Active Assignments',
      count: activeAssignments.length,
    },
    {
      id: 'completed',
      label: 'Completed Assignments',
      count: completedAssignments.length,
    },
  ]

  const selectedSection = sections.find((section) => section.id === activeSection)

  const selectSection = (sectionId) => {
    setActiveSection(sectionId)
    setIsSectionMenuOpen(false)
  }

  const renderAssignmentList = (items, emptyMessage) => {
    if (loading) {
      return <p className="mt-6 text-sm text-slate-500">Loading assignments...</p>
    }

    if (items.length === 0) {
      return (
        <div className="mt-6 rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {emptyMessage}
        </div>
      )
    }

    return (
      <div className="mt-6 space-y-3">
        {items.map((delivery) => (
          <div
            key={delivery.id}
            className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-slate-900">
                #{delivery.id} · {delivery.customer_name}
              </p>
              <p className="break-words text-sm text-slate-500">
                Rider: {delivery.rider_name || '—'} · {delivery.item_description}
              </p>
            </div>
            <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {delivery.confirmed ? 'CONFIRMED' : delivery.status}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DashboardLayout role="dispatcher">
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Dispatcher Dashboard
          </h2>
          <p className="mt-2 text-slate-600">
            Manage delivery requests and rider assignments.
          </p>
        </div>

        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="relative md:hidden">
          <button
            type="button"
            aria-expanded={isSectionMenuOpen}
            onClick={() => setIsSectionMenuOpen((current) => !current)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm"
          >
            <span>
              <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                Dashboard section
              </span>
              <span className="mt-1 block text-sm font-semibold text-slate-900">
                {selectedSection.label}
              </span>
            </span>
            <span className="text-lg text-slate-500">{isSectionMenuOpen ? '−' : '+'}</span>
          </button>

          {isSectionMenuOpen && (
            <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => selectSection(section.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium ${
                    activeSection === section.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{section.label}</span>
                  <span>{section.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
          <aside className="hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:block">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Dispatcher dashboard
            </p>
            <nav className="space-y-1" aria-label="Dispatcher dashboard sections">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => selectSection(section.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium transition ${
                    activeSection === section.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{section.label}</span>
                  <span>{section.count}</span>
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
          {activeSection === 'pending' && <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

          {!loading && deliveries.length === 0 && (
            <div className="mt-6 rounded-lg bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm text-slate-500">
                No pending delivery requests.
              </p>
            </div>
          )}

          {!loading && deliveries.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Address</th>
                    <th className="px-4 py-3 font-medium">Rider</th>
                    <th className="px-4 py-3 font-medium">Action</th>
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
                        <select
                          value={
                            selectedRiders[delivery.id] || riders[0]?.id || ''
                          }
                          onChange={(event) =>
                            setSelectedRiders((current) => ({
                              ...current,
                              [delivery.id]: event.target.value,
                            }))
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                          {riders.length === 0 && (
                            <option value="">No riders</option>
                          )}
                          {riders.map((rider) => (
                            <option key={rider.id} value={rider.id}>
                              {rider.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleAssignRider(delivery.id)}
                          disabled={assigningId === delivery.id || riders.length === 0}
                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {assigningId === delivery.id
                            ? 'Assigning...'
                            : 'Assign Rider'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>}

          {activeSection === 'active' && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">Active Assignments</h3>
              <p className="mt-1 text-sm text-slate-500">Monitor deliveries currently with riders.</p>
              {renderAssignmentList(activeAssignments, 'No active assignments yet.')}
            </div>
          )}

          {activeSection === 'completed' && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">Completed Assignments</h3>
              <p className="mt-1 text-sm text-slate-500">Review deliveries that have been completed.</p>
              {renderAssignmentList(completedAssignments, 'No completed assignments yet.')}
            </div>
          )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DispatcherDashboard
