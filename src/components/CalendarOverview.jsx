import React, { useState, useEffect } from 'react'

export default function CalendarOverview() {
  const [calendars, setCalendars] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/calendars')
      .then(response => response.json())
      .then(data => setCalendars(data))
      .catch(() => setError('Error loading calendar data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading data...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {Array.isArray(calendars) && calendars.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold">Team Calendars</h2>
          {/* Render calendars here */}
        </div>
      ) : (
        <div>No meetings scheduled.</div>
      )}
    </div>
  )
}