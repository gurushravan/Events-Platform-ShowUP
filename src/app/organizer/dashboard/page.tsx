'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type OrganizerEvent = {
  id: string
  title: string
  date: string
  capacity: number
  booked: number
  remaining: number
  isDeleted: boolean
  checkedIn: number
}

export default function OrganizerDashboardPage() {
  const router = useRouter()
  const [events, setEvents] = useState<OrganizerEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const res = await fetch('/api/organizer/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await res.json()
      setEvents(data)
      setLoading(false)
    }

    load()
  }, [router])

  async function handleDelete(eventId: string) {
    const confirmed = confirm(
      'Are you sure you want to delete this event? This cannot be undone.'
    )

    if (!confirmed) return

    const res = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      setEvents(prev =>
        prev.map(e =>
          e.id === eventId
            ? { ...e, isDeleted: true }
            : e
        )
      )
    } else {
      alert('Failed to delete event')
    }
  }

  return (
    <>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="mb-6 text-xl font-semibold">
          Organizer dashboard
        </h1>

        {loading ? (
          <p className="text-sm text-gray-600">
            Loading events...
          </p>
        ) : events.length === 0 ? (
          <p className="text-sm text-gray-600">
            You have not created any events yet.
          </p>
        ) : (
          <div className="space-y-4">
            {events.map(event => {
              const percent = Math.round(
                (event.booked / event.capacity) * 100
              )

              return (
                <div
                  key={event.id}
                  className={`rounded border p-4 ${
                    event.isDeleted
                      ? 'bg-gray-50 opacity-70'
                      : ''
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">
                      {event.title}
                    </h2>

                    <span className="text-xs text-gray-600">
                      {new Date(event.date).toDateString()}
                    </span>
                  </div>

                  <p className="mb-1 text-xs text-gray-600">
                    {event.booked + event.checkedIn} / {event.capacity} tickets used
                  </p>

                  <p className="text-xs text-gray-500">
                    {event.checkedIn} checked in
                  </p>


                  <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
                    <div
                      className={`h-full ${
                        percent >= 90
                          ? 'bg-red-500'
                          : percent >= 70
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    {event.remaining > 0
                      ? `${event.remaining} tickets remaining`
                      : 'Sold out'}
                  </p>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-3">
                    {event.isDeleted ? (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                        Deleted
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            router.push(
                              `/organizer/events/${event.id}/edit`
                            )
                          }
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(event.id)
                          }
                          className="text-sm text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>


    </>
  )
}
