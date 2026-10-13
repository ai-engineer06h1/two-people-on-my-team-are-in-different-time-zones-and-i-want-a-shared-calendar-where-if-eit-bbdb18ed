import React from 'react'
import CalendarOverview from './components/CalendarOverview'
import ProposeMeeting from './components/ProposeMeeting'

export default function App() {
  const [showCalendar, setShowCalendar] = React.useState(true)

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h1 className="text-xl font-bold">Scheduling Tool</h1>
        <nav aria-label="Primary">
          <ul className="flex gap-2 list-none p-0 m-0">
            <li>
              <button
                className={`px-4 py-2 rounded ${showCalendar ? 'bg-gray-200' : 'bg-white'}`}
                onClick={() => setShowCalendar(true)}
                aria-current={showCalendar ? 'page' : undefined}
                aria-pressed={showCalendar}
              >
                Calendar Overview
              </button>
            </li>
            <li>
              <button
                className={`px-4 py-2 rounded ${!showCalendar ? 'bg-gray-200' : 'bg-white'}`}
                onClick={() => setShowCalendar(false)}
                aria-current={!showCalendar ? 'page' : undefined}
                aria-pressed={!showCalendar}
              >
                Propose Meeting
              </button>
            </li>
          </ul>
        </nav>
      </header>
      <main>{showCalendar ? <CalendarOverview /> : <ProposeMeeting />}</main>
    </div>
  )
}