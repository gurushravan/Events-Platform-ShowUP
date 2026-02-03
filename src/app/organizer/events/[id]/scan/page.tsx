'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type SuccessData = {
  eventTitle: string
  ticketId: string
  quantity: number
  attendeeId: string
}

type ResultState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: SuccessData }
  | { status: 'error'; message: string }

export default function EventScanPage() {
  const { id: eventId } = useParams<{ id: string }>()
  const router = useRouter()

  const [ticketId, setTicketId] = useState('')
  const [result, setResult] = useState<ResultState>({ status: 'idle' })
  const [organizerId, setOrganizerId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      setOrganizerId(user.id)
    }

    init()
  }, [router])

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()

    if (!ticketId.trim() || !organizerId) return

    setResult({ status: 'loading' })

    const res = await fetch('/api/tickets/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketId: ticketId.trim(),
        organizerId
      })
    })

    const data = await res.json()

    if (res.ok) {
      setResult({
        status: 'success',
        data
      })
      setTicketId('')
    } else {
      setResult({
        status: 'error',
        message: data.error || 'Validation failed'
      })
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-1 text-xl font-semibold">
        Scan tickets
      </h1>

      <p className="mb-6 text-sm text-gray-600">
        Event ID: {eventId}
      </p>

      <form onSubmit={handleScan} className="space-y-4">
        <input
          value={ticketId}
          onChange={e => setTicketId(e.target.value)}
          placeholder="Enter ticket ID"
          className="w-full rounded border px-3 py-2 text-sm"
          autoFocus
        />

        <button
          type="submit"
          disabled={result.status === 'loading'}
          className="w-full rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {result.status === 'loading'
            ? 'Checking...'
            : 'Check in ticket'}
        </button>
      </form>

      {/* SUCCESS */}
      {result.status === 'success' && (
        <div className="mt-5 rounded border border-green-300 bg-green-50 p-3 text-sm">
          <p className="mb-2 font-semibold text-green-800">
            ✅ Check-in successful
          </p>

          <p>
            <span className="font-medium">Event:</span>{' '}
            {result.data.eventTitle}
          </p>

          <p>
            <span className="font-medium">Attendee:</span>{' '}
            {result.data.attendeeId}
          </p>

          <p>
            <span className="font-medium">Tickets:</span>{' '}
            {result.data.quantity}
          </p>

          <p className="mt-1 text-xs text-gray-600">
            Ticket ID: {result.data.ticketId}
          </p>
        </div>
      )}

      {/* ERROR */}
      {result.status === 'error' && (
        <div className="mt-5 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          ❌ {result.message}
        </div>
      )}

      <button
        onClick={() => router.push('/organizer/dashboard')}
        className="mt-6 text-sm text-blue-600 hover:underline"
      >
        ← Back to dashboard
      </button>
    </main>
  )
}
