import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'


export default function UserHome() {
  const location = useLocation()
  const username = location.state?.username || 'Guest'

  const [appointments, setAppointments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [preferences, setPreferences] = useState([])
  const [showPreferences, setShowPreferences] = useState(false)

  const [formData, setFormData] = useState({
    location: '',
    power: '',
    timeWindow: '',
  })

  // Dummy appointments
  useEffect(() => {
    const dummyAppointments = [
      { id: 1, station: 'Station A', time: '2025-08-01T10:00:00', power: '50kW' },
      { id: 2, station: 'Station B', time: '2025-08-01T14:00:00', power: '22kW' },
    ];
    setAppointments(dummyAppointments);
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

        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
        >
          See Alerts
        </button>

      </div>

      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-white p-4 rounded shadow mb-6 max-w-md"
        >
          <h2 className="text-xl font-semibold mb-4">Create a Preference</h2>

          <label className="block mb-1 font-medium">Station</label>
          <input
            type="text"
            required
            className="w-full mb-3 p-2 border rounded"
            value={formData.station_id}
            onChange={(e) => setFormData({ ...formData, station_id: e.target.value })}
          />

          <label className="block mb-1 font-medium">Connector Type</label>
          <input
            type="text"
            required
            className="w-full mb-3 p-2 border rounded"
            value={formData.connector_type}
            onChange={(e) => setFormData({ ...formData, connector_type: e.target.value })}
          />

          <label className="block mb-1 font-medium">Power</label>
          <input
            type="text"
            required
            className="w-full mb-3 p-2 border rounded"
            value={formData.power}
            onChange={(e) => setFormData({ ...formData, power: e.target.value })}
          />

          <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            required
            className="w-full mb-3 p-2 border rounded"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

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
              <li key={index} className="bg-white p-3 rounded shadow">
                ⛽ Station {pref.station_id} | 🔌 Connector Type {pref.connector_type} | ⚡ Power {pref.power} | 📍 Location {pref.location}  
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
              ⏰ Time: {new Date(appt.time).toLocaleString()}
            </p>
            <p className="text-gray-700 mb-4">⚡ Power: {appt.power}</p>
            <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
              Reserve
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
