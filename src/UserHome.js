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

  const [formData, setFormData] = useState({
    location: '',
    power: '',
    timeWindow: '',
  })

  useEffect(() => {
    async function fetchShifts() {
      try {
        const res = await fetch(`http://localhost:5014/users/${username}/shifts`)
        const data = await res.json()
        setAppointments(
          Object.values(data.shifts).map((shift) => ({
            id: shift.shift_id,
            station: shift.station_id,
            start_time: shift.start_time,
            end_time: shift.end_time,
            power: `${shift.power_kw}kW`,
            connector_type: shift.connector_type,
            location: shift.location
          }))
        )
      } catch (error) {
        console.error('Error fetching appointments:', error)
      }
    }

    fetchShifts()
  }, [])

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
        power: "",
        location: "",
      })
      setShowForm(false)
      alert('Preference created!')
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSeePreferences = async () => {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, {username}!</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => setShowForm((prev) => !prev)}
        >
          Create Preference
        </button>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={handleSeePreferences}
        >
          See Preferences
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

          <label className="block mb-1 font-medium">Connector Type</label>
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
            onChange={(e) => setFormData({ ...formData, power: e.target.value })}
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

      {showPreferences && preferences.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Your Preferences</h2>
          <ul className="space-y-2">
            {preferences.map((pref, index) => (
              <li key={index} className="bg-white p-3 rounded shadow flex items-center justify-between">
                <div>
                  ⛽ Station {pref.station_id} | 🔌 Connector Type {pref.connector_type} | ⚡ Power {pref.power} | 📍 Location {pref.location}
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
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appt) => (
          <div key={appt.id} className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-2">⛽ {appt.station}</h2>
            <p className="text-gray-700 mb-1">
              ⏰ Time: {new Date(appt.start_time).toLocaleString()} - {new Date(appt.end_time).toLocaleString()}
            </p>
            <p className="text-gray-700 mb-1">🔌Connector Type: {appt.connector_type} </p>
            <p className="text-gray-700 mb-1">⚡Power: {appt.power}</p>
            <p className="text-gray-700 mb-4">📍Location: {appt.location}</p>
            <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
              Select
            </button>
          </div>
        ))}
      </div>

    </div>
  )
}
