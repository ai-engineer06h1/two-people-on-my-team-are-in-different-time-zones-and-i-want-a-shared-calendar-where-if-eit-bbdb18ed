import React, { useState } from 'react'

export default function ProposeMeeting() {
  const [time, setTime] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = () => {
    if (!time) {
      setError('Invalid meeting time')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    fetch('/api/propose-meeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ time })
    })
    .then(async response => {
      if (!response.ok) {
        const text = await response.text()
        let detail = `HTTP ${response.status}: ${response.statusText}`
        try {
          const parsed = JSON.parse(text)
          if (parsed.detail) detail = parsed.detail
        } catch {}
        throw new Error(detail)
      }
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error('Expected JSON response')
      }
      return response.json()
    })
    .then(data => {
      setResult(data)
      if (data.success) {
        setError(null)
      } else {
        setError('Proposed time falls outside working hours for some attendees.')
      }
    })
    .catch(err => {
      setResult(null)
      setError(err.message || 'Error submitting proposal')
    })
    .finally(() => setLoading(false))
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold">Propose a Meeting</h2>
      <label htmlFor="meeting-time" className="block text-sm font-medium text-gray-700 mt-2">
        Meeting time (your local)
      </label>
      <input
        id="meeting-time"
        type="datetime-local"
        value={time}
        onChange={e => setTime(e.target.value)}
        className="border rounded px-2 py-1 mb-4 w-full"
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={loading}
        aria-label="Submit meeting proposal"
      >
        {loading ? 'Submitting...' : 'Submit Proposal'}
      </button>

      {error && <div className="text-red-500 mt-2">{error}</div>}

      {result && Array.isArray(result.attendees) && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-gray-700">
            Proposed UTC time:{" "}
            <time dateTime={result.proposedAtUtc}>{result.proposedAtUtc}</time>
          </p>
          <div className="grid gap-3">
            {result.attendees.map(person => (
              <div
                key={person.id}
                className={`border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
                  person.overlapsWorkingHours ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div>
                  <span className="font-semibold">{person.name}</span>
                  <span className="text-sm text-gray-600 ml-2">({person.timezone})</span>
                </div>
                <div className="text-sm">
                  Local:{' '}
                  <time dateTime={person.localTime}>{person.localTime}</time>
                  {' — '}
                  <span className={person.overlapsWorkingHours ? 'text-green-700' : 'text-red-700'}>
                    {person.overlapsWorkingHours ? 'Inside working hours' : 'Outside working hours'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}