import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function getCoordinates(venue: string, city: string) {
  const query = encodeURIComponent(`${venue} ${city}`)

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
    {
      headers: {
        'User-Agent': 'events-platform'
      }
    }
  )

  const data = await res.json()

  if (!data || data.length === 0) {
    return { lat: null, lon: null }
  }

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  }
}

export async function POST(req: Request) {
  const body = await req.json()

  const {
    title,
    description,
    category,
    date,
    startTime,
    endTime,
    price,
    venue,
    city,
    capacity,
    isHiddenGem,
    organizerId
  } = body

  if (
    !title ||
    !description ||
    !category ||
    !date ||
    !startTime ||
    !endTime ||
    price === undefined ||
    !venue ||
    !city ||
    capacity === undefined ||
    !organizerId
  ) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Ensure the user exists
  const user = await prisma.user.upsert({
    where: { id: organizerId },
    update: {},
    create: {
      id: organizerId,
      email: 'temp@email.com',
      role: 'ORGANIZER'
    }
  })

  // Get coordinates for venue
  const { lat, lon } = await getCoordinates(venue, city)

  const event = await prisma.event.create({
    data: {
      title,
      description,
      category,
      date: new Date(date),
      startTime,
      endTime,
      price: Number(price),
      venue,
      city,
      capacity: Number(capacity),
      isHiddenGem: Boolean(isHiddenGem),
      organizerId: user.id,
      latitude: lat,
      longitude: lon
    }
  })

  return NextResponse.json(event)
}