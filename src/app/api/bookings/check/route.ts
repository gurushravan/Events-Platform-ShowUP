import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    let userId: string | null = null
    let eventId: string | null = null

    try {
      const body = await req.json()
      userId = body?.userId ?? null
      eventId = body?.eventId ?? null
    } catch {
      userId = null
      eventId = null
    }

    if (!userId || !eventId) {
      return NextResponse.json({
        booked: false
      })
    }

    const booking = await prisma.booking.findFirst({
      where: {
        userId,
        eventId,
        status: 'CONFIRMED'
      }
    })

    return NextResponse.json({
      booked: !!booking
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}