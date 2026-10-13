import React, { useState, useEffect } from 'react'

export default function CalendarOverview() {
  const [calendars, setCalendars] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/calendars')
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          throw new Error('Expected JSON response')
        }
        return response.json()
      })
      .then(data => setCalendars(data))
      .catch(err => setError(err.message || 'Error loading calendar data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading data...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {Array.isArray(calendars) && calendars.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">Team Calendars</h2>
          <div className="grid gap-4">
            {calendars.map(calendar => (
              <div
                key={calendar.id}
                className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{calendar.name}</h3>
                  <p className="text-sm text-gray-600">Timezone: {calendar.timezone}</p>
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Working hours:</span>{' '}
                  {Array.isArray(calendar.workingHours)
                    ? calendar.workingHours
                        .map(wh => `${wh.start || '?'}–${wh.end || '?'}`)
                        .join(', ')
                    : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>No meetings scheduled.</div>
      )}
    </div>
  )
}