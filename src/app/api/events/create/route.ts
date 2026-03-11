import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
  const formData = await req.formData()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const date = formData.get('date') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string
  const price = formData.get('price') as string
  const venue = formData.get('venue') as string
  const city = formData.get('city') as string
  const capacity = formData.get('capacity') as string
  const isHiddenGem = formData.get('isHiddenGem') === 'true'
  const organizerId = formData.get('organizerId') as string
  const image = formData.get('image') as File | null

  if (
    !title ||
    !description ||
    !category ||
    !date ||
    !startTime ||
    !endTime ||
    !price ||
    !venue ||
    !city ||
    !capacity ||
    !organizerId
  ) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  let imageUrl: string | null = null

  if (image && image.size > 0) {
    const fileName = `${Date.now()}-${image.name}`

    const { error } = await supabase.storage
      .from('event-images')
      .upload(fileName, image)

    if (!error) {
      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-images/${fileName}`
    }
  }

  const user = await prisma.user.upsert({
    where: { id: organizerId },
    update: {},
    create: {
      id: organizerId,
      email: 'temp@email.com',
      role: 'ORGANIZER'
    }
  })

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
      isHiddenGem,
      organizerId: user.id,
      latitude: lat,
      longitude: lon,
      imageUrl
    }
  })

  return NextResponse.json(event)
}