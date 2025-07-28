import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'


export default function UserHome() {
  const location = useLocation()
  const username = location.state?.username || 'Guest'

  const [appointments, setAppointments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [preferences, setPreferences] = useState([])
  const [showPreferences, setShowPreferences] = useState(false)
  const [stations, setStations] = useState([])
  const [connectorTypes, setConnectorTypes] = useState([])
  const [powerLevels, setPowerLevels] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [countdown, setCountdown] = useState(60)
  const [timerActive, setTimerActive] = useState(false)
  const [createdNewPreference, setCreatedNewPreference] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [reservations, setReservations] = useState([])
  const [showReservations, setShowReservations] = useState(false)
  const [preReservationId, setPreReservationId] = useState(false)

  useEffect(() => {
    if (timerActive && countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)

      return () => clearInterval(interval)
    } else if (countdown === 0) {
      setSelectedAppointment(null)
      setTimerActive(false)
      setPreReservationId(null) 
    }
  }, [timerActive, countdown])

  const [formData, setFormData] = useState({})

  useEffect(() => {
    async function fetchShifts() {
      try {
        const res = await fetch(`http://localhost:5014/users/${username}/shifts`)
        const data = await res.json()
        setAppointments(
          Object.values(data.shifts).map((shift) => ({
            shift_id: shift.shift_id,
            point_id: shift.point_id,
            station: shift.station_id,
            start_time: shift.start_time,
            end_time: shift.end_time,
            power_kw: shift.power_kw,
            connector_type: shift.connector_type,
            location: shift.location,
            matching_preferences_count: shift.matching_preferences_count
          }))
        )
      } catch (error) {
        console.error('Error fetching appointments:', error)
      }
    }

    fetchShifts()
  }, [createdNewPreference])

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('http://localhost:5014/stations')
        if (!response.ok) throw new Error('Failed to fetch stations')
        const data = await response.json()
        setStations(data)

        const connectorSet = new Set()
        const powerSet = new Set()

        data.stations.forEach((station) => {
          station.charging_points.forEach((point) => {
            connectorSet.add(point.connector_type)
            powerSet.add(point.power_kw)
          })
        })

        setConnectorTypes(Array.from(connectorSet))
        setPowerLevels(Array.from(powerSet).sort((a, b) => a - b))
      } catch (error) {
        console.error('Error fetching stations:', error)
      }
    }

    fetchStations()
  }, [])

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    const endpoint = 'http://localhost:5014/users/preferences'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, username }),
      })

      if (!response.ok) throw new Error('Failed to create preference')

      setFormData({
        username: username,
        station_id: "",
        connector_type: "",
        power_kw: 0,
        location: "",
      })
      setShowForm(false)
      alert('Preference created!')
      setCreatedNewPreference(true)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSeePreferences = async () => {
    if (showPreferences) {
      setShowPreferences(false)
      return
    }

    // Otherwise, fetch and show preferences
    const endpoint = `http://localhost:5014/users/${username}/preferences`

    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch preferences')

      const data = await res.json()
      console.log(data)
      setPreferences(data.preferences)
      setShowPreferences(true)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleNotifications = async () => {
    if (showNotifications) {
      setShowNotifications(false)
      return
    }

    // Otherwise, fetch and show notifications
    const endpoint = `http://localhost:5014/users/${username}/notifications`

    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch notifications')

      const data = await res.json()
      console.log(data)
      setNotifications(data.notifications || [])
      setShowNotifications(true)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleReservations = async () => {
    if (showReservations) {
      setShowReservations(false)
      return
    }

    const endpoint = `http://localhost:5014/shifts/pre-reservations/user/${username}`

    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch reservations')

      const data = await res.json()
      console.log(data)
      setReservations(data.pre_reservations || [])
      setShowReservations(true)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, {username}!</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => setShowForm((prev) => !prev)}
        >
          Create preference
        </button>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={handleSeePreferences}
        >
          See preferences
        </button>

        <button
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
          onClick={handleNotifications}
        >
          Notifications
        </button>

        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          onClick={handleReservations}
        >
          Reservations
        </button>

      </div>

      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-white p-4 rounded shadow mb-6 max-w-md"
        >
          <h2 className="text-xl font-semibold mb-4">Create a Preference</h2>

          <label className="block mb-1 font-medium">Station</label>
          <select
            className="w-full mb-3 p-2 border rounded"
            value={formData.station_id}
            onChange={(e) => setFormData({ ...formData, station_id: e.target.value })}
          >
            <option value="">Select a station</option>
            {stations.stations.map((station) => (
              <option key={station.station_id} value={station.station_id}>
                {station.station_id}
              </option>
            ))}
          </select>

          <label className="block mb-1 font-medium">Connector type</label>
          <select
            className="w-full mb-3 p-2 border rounded"
            value={formData.connector_type}
            onChange={(e) => setFormData({ ...formData, connector_type: e.target.value })}
          >
            <option value="">Select a connector</option>
            {connectorTypes.map((type) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>

          <label className="block mb-1 font-medium">Power</label>
          <select
            className="w-full mb-3 p-2 border rounded"
            value={formData.power}
            onChange={(e) => setFormData({ ...formData, power_kw: parseInt(e.target.value) })}
          >
            <option value="">Select power</option>
            {powerLevels.map((kw) => (
              <option key={kw} value={kw}>
                {kw} kW
              </option>
            ))}
          </select>

          <label className="block mb-1 font-medium">Location</label>
          <select
            className="w-full mb-3 p-2 border rounded"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          >
            <option value="">Select a location</option>
            {stations.stations.map((station) => (
              <option key={station.station_id} value={station.location.address}>
                {station.location.address}
              </option>
            ))}
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Submit
          </button>
        </form>
      )}

      {showPreferences && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Your preferences</h2>
          {preferences.length > 0 ? (
            <ul className="space-y-2">
              {preferences.map((pref, index) => (
                <li key={index} className="bg-white p-3 rounded shadow flex items-center justify-between">
                  <div>
                    {[
                      pref.station_id && `⛽ Station ${pref.station_id}`,
                      pref.connector_type && `🔌 Connector type ${pref.connector_type}`,
                      pref.power_kw && `⚡ Power ${pref.power_kw}kW`,
                      pref.location && `📍 Location ${pref.location}`
                    ].filter(Boolean).join(' | ')}
                  </div>

                  <label className="inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={pref.alert}
                      onChange={async (e) => {
                        const updatedStatus = e.target.checked

                        try {
                          const res = await fetch(`http://localhost:5014/users/alert`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              username: username,
                              preference_id: pref.preference_id,
                              alert: updatedStatus
                            }),
                          });

                          if (!res.ok) throw new Error('Failed to update preference')

                          setPreferences((prev) =>
                            prev.map((p, i) =>
                              i === index ? { ...p, alert: updatedStatus } : p
                            )
                          )
                        } catch (err) {
                          alert(err.message)
                        }
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-checked:bg-green-500 rounded-full relative transition-all duration-300">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 peer-checked:translate-x-full transition-transform duration-300"></div>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded text-center">
              <p className="text-gray-600">No preferences available</p>
            </div>
          )}
        </div>
      )}

      {showNotifications && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Notifications</h2>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div key={index} className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r shadow">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-orange-400 text-xl">🔔</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-orange-800">{notification}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded text-center">
              <p className="text-gray-600">No notifications available</p>
            </div>
          )}
        </div>
      )}

      {showReservations && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Reservations</h2>
          {reservations.length > 0 ? (
            <div className="space-y-3">
              {reservations.map((reservation, index) => (
                <div key={index} className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r shadow">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-purple-400 text-xl">📋</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-purple-800">
                        <p className="font-semibold mb-1">
                          Status: <span className={`${reservation.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {reservation.status}
                          </span>
                        </p>
                        <p className="text-sm mb-1">🔗 Shift: {reservation.shift_id}</p>
                        <p className="text-sm mb-1">📅 Created: {new Date(reservation.created_at).toLocaleString()}</p>
                        {reservation.confirmed_at && (
                          <p className="text-sm mb-1">✅ Confirmed: {new Date(reservation.confirmed_at).toLocaleString()}</p>
                        )}
                        <p className="text-sm">⏰ Expires: {new Date(reservation.expires_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded text-center">
              <p className="text-gray-600">No reservations available</p>
            </div>
          )}
        </div>
      )}

      {appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appt) => (
          <div key={appt.shift_id} className={`bg-white rounded-lg shadow p-4 border-2 ${selectedAppointment?.shift_id == appt.shift_id ? " border-blue-700" : "border-transparent"}`}>
            <h2 className="text-xl font-semibold mb-2">⛽ {appt.station}</h2>
            <p className="text-gray-700 mb-1">
              ⏰ Time: {new Date(appt.start_time).toLocaleString()} - {new Date(appt.end_time).toLocaleString()}
            </p>
            <p className="text-gray-700 mb-1">🔗 Point: {appt.point_id}</p>
            <p className="text-gray-700 mb-1">🔌Connector type: {appt.connector_type} </p>
            <p className="text-gray-700 mb-1">⚡Power: {appt.power_kw}kW</p>
            <p className="text-gray-700 mb-4">📍Location: {appt.location}</p>
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
              onClick={async () => {
                setSelectedAppointment(appt)

                console.log(appt)

                try {
                  if (!preReservationId) {
                    const res = await fetch(`http://localhost:5014/shifts/pre-reservations`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        shift_id: appt.shift_id,
                        user_id: username,
                      }),
                    })

                    const preReservationResp = await res.json()
                    setPreReservationId(preReservationResp.pre_reservation.pre_reservation_id)

                    setCountdown(60)
                    setTimerActive(true)
                  } else {
                    const res = await fetch(`http://localhost:5014/shifts/pre-reservations`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        pre_reservation_id: preReservationId,
                        shift_id: appt.shift_id,
                        user_id: username,
                      }),
                    })

                    if (!res.ok) {
                      throw new Error('Failed to update pre-reservation')
                    }
                  }
                } catch (error) {
                  console.error('Error selecting shift:', error)
                }
              }}
            >
              Select
            </button>
            <div className='text-sm italic mt-3'>
              {
                (appt.matching_preferences_count > 0) ? 
                <p className="text-green-700 mb-1"> Matches {appt.matching_preferences_count} of your preferences</p> 
                :
                <p className="text-red-700 mb-1">No matching preferences</p>
              }
            </div>
          </div>
        ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 p-8 rounded text-center">
          <div className="text-gray-400 text-6xl mb-4">⛽</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No shifts available</h3>
          <p className="text-gray-600">There are currently no shifts available. Please check back later.</p>
        </div>
      )}

      {selectedAppointment && (
        <div className="mt-6 p-4 border rounded-lg shadow bg-yellow-50">
          <h2 className="text-lg font-semibold mb-2">Confirm reservation</h2>
          <p className="mb-2 text-gray-700">
            ⏳ Time left to reserve: <span className="font-bold">{countdown}s</span>
          </p>
          <p className="mb-2 text-gray-700">
            ⛽ Station: {selectedAppointment.station}
          </p>
          <p className="mb-2 text-gray-700">
            🔌 Connector: {selectedAppointment.connector_type}
          </p>
          <p className="mb-2 text-gray-700">
            ⚡ Power: {selectedAppointment.power_kw}kW
          </p>
          <p className="mb-4 text-gray-700">
            📍Location: {selectedAppointment.location}
          </p>

          <button
            onClick={async () => {
              try {
                const res = await fetch(`http://localhost:5014/shifts/pre-reservations/${preReservationId}/confirm`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                })

                if (res.ok) {
                  alert("Shift reserved!")
                  setSelectedAppointment(null)
                  setTimerActive(false)
                  setPreReservationId(null)
                } else {
                  alert("Failed to reserve shift.")
                }
              } catch (error) {
                console.error("Error reserving shift:", error)
              }
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Reserve
          </button>
        </div>
      )}

    </div>
  )
}
