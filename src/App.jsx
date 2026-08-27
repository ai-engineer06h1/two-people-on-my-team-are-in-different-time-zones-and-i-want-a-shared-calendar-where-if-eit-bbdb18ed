import React from 'react'
import CalendarOverview from './components/CalendarOverview'
import ProposeMeeting from './components/ProposeMeeting'

export default function App() {
  const [showCalendar, setShowCalendar] = React.useState(true)

  return (
    <div className="max-w-4xl mx-auto py-8">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Scheduling Tool</h1>
        <nav>
          <button
            className={`px-4 py-2 ${showCalendar ? 'bg-gray-200' : 'bg-white'} rounded`}
            onClick={() => setShowCalendar(true)}
          >
            Calendar Overview
          </button>
          <button
            className={`px-4 py-2 ${!showCalendar ? 'bg-gray-200' : 'bg-white'} rounded`}
            onClick={() => setShowCalendar(false)}
          >
            Propose Meeting
          </button>
        </nav>
      </header>
      {showCalendar ? <CalendarOverview /> : <ProposeMeeting />}
    </div>
  )
}