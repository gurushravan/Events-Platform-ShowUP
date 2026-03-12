'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

type EventData = {
  title: string
  date: string
  venue: string
}

type BookingData = {
  id: string
  ticketId: string
  event: EventData | null
}

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bookingId) {
      setError('Missing booking ID')
      setLoading(false)
      return
    }

    async function fetchBooking() {
      try {
        const res = await fetch('/api/bookings/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId })
        })

        if (!res.ok) {
          throw new Error('Failed to fetch booking')
        }

        const data = await res.json()

        if (!data || !data.ticketId) {
          throw new Error('Invalid booking data')
        }

        setBooking({
          id: data.id,
          ticketId: data.ticketId,
          event: data.event ?? null
        })
      } catch {
        setError('Unable to load booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="mb-2 text-xl font-semibold">
        Booking confirmed
      </h1>

      <p className="mb-6 text-sm text-gray-600">
        Your ticket is ready. Show this QR code at the venue.
      </p>

      {loading && (
        <p className="text-sm text-gray-500">
          Loading ticket…
        </p>
      )}

      {!loading && error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && booking && booking.event && (
        <div className="mb-6 rounded-lg border p-4">
          <div className="mb-4 flex justify-center">
            <QRCodeCanvas
              value={booking.ticketId}
              size={180}
              level="H"
            />
          </div>

          <div className="text-sm">
            <p className="font-medium">
              {booking.event.title}
            </p>
            <p className="text-gray-600">
              {formatDate(booking.event.date)}
            </p>
            <p className="text-gray-600">
              {booking.event.venue}
            </p>
          </div>

          <div className="mt-3 rounded bg-black-100 px-2 py-1 text-xs">
            Ticket ID: {booking.ticketId}
          </div>
        </div>
      )}

      {!loading && booking && !booking.event && (
        <p className="text-sm text-gray-600">
          Booking found, but event details are unavailable.
        </p>
      )}

      <div className="flex justify-center gap-4">
        <Link
          href="/bookings"
          className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          View my bookings
        </Link>

        <Link
          href="/"
          className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
        >
          Go home
        </Link>
      </div>
    </main>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading…</div>}>
      <BookingSuccessContent />
    </Suspense>
  )
}