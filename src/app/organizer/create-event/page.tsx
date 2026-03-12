'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
      }
    }

    checkAuth()
  }, [router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/login')
      return
    }

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    // attach organizer id
    formData.append('organizerId', user.id)

    const res = await fetch('/api/events/create', {
      method: 'POST',
      body: formData
    })

    if (res.ok) {
      router.push('/organizer/dashboard')
    } else {
      alert('Failed to create event')
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold">
        Create event
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="Event title"
          required
          className="w-full rounded border px-3 py-2"
        />

        <textarea
          name="description"
          placeholder="Event description"
          required
          className="w-full rounded border px-3 py-2"
        />

        <input
          name="category"
          placeholder="Category (Music, Comedy, etc)"
          required
          className="w-full rounded border px-3 py-2"
        />

        <input
          type="date"
          name="date"
          required
          min={today}
          className="icon-white w-full rounded border px-3 py-2"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="time"
            name="startTime"
            required
            className="icon-white w-full rounded border px-3 py-2"
          />
          <input
            type="time"
            name="endTime"
            required
            className="icon-white w-full rounded border px-3 py-2"
          />
        </div>

        <input
          type="number"
          name="price"
          placeholder="Ticket price"
          required
          min={0}
          className="w-full rounded border px-3 py-2"
        />

        <input
          type="number"
          name="capacity"
          placeholder="Total capacity"
          required
          min={1}
          className="w-full rounded border px-3 py-2"
        />

        <input
          name="venue"
          placeholder="Venue"
          required
          className="w-full rounded border px-3 py-2"
        />

        <input
          name="city"
          placeholder="City"
          required
          className="w-full rounded border px-3 py-2"
        />

        <div>
          <label className="block text-sm mb-1">
            Event image
          </label>

          <label className="inline-block cursor-pointer rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
            Choose file
            <input
              type="file"
              name="image"
              accept="image/*"
              className="hidden"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isHiddenGem" />
          Mark as Hidden Gem
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {loading ? 'Creating...' : 'Create event'}
        </button>
      </form>
    </main>
  )
}