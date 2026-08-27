import React, { useState } from 'react'

export default function ProposeMeeting() {
  const [time, setTime] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    if (!time) {
      setError('Invalid meeting time')
      return
    }

    setLoading(true)
    fetch('/api/propose-meeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ time })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setError(null)
        alert('Success: Meeting proposal submitted!')
      } else {
        setError('Overlap calculation error')
      }
    })
    .catch(() => setError('Error submitting proposal'))
    .finally(() => setLoading(false))
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold">Propose a Meeting</h2>
      <input
        type="datetime-local"
        value={time}
        onChange={e => setTime(e.target.value)}
        className="border rounded px-2 py-1 mb-4 w-full"
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Proposal'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  )
}