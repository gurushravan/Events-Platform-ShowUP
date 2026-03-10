'use client'

import { useEffect, useState } from 'react'
import EventCard from '@/components/events/EventCard'
import { createClient } from '@supabase/supabase-js'

type Event = {
  id: string
  title: string
  category: string
  date: Date
  startTime: string
  price: number
  venue: string
  latitude: number | null
  longitude: number | null
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371

  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export default function ExploreResults({
  events
}: {
  events: Event[]
}) {
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)

  useEffect(() => {
    async function loadSavedIds() {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) return

      const res = await fetch('/api/saved/ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const ids = await res.json()
      setSavedIds(ids)
    }

    loadSavedIds()
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(pos => {
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      })
    })
  }, [])

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map(event => {
        let distance = null

        if (
          userLocation &&
          event.latitude !== null &&
          event.longitude !== null
        ) {
          distance = getDistance(
            userLocation.lat,
            userLocation.lng,
            event.latitude,
            event.longitude
          )
        }

        return (
          <EventCard
            key={event.id}
            id={event.id}
            title={event.title}
            category={event.category}
            date={new Date(event.date).toDateString()}
            time={event.startTime}
            price={event.price}
            venue={event.venue}
            distance={distance ? Number(distance.toFixed(1)) : 0}
            isSaved={savedIds.includes(event.id)}
          />
        )
      })}
    </div>
  )
}