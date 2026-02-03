import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { ticketId, organizerId } = await req.json()

  if (!ticketId || !organizerId) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  const booking = await prisma.booking.findUnique({
    where: { ticketId },
    include: {
      event: {
        select: {
          organizerId: true,
          title: true
        }
      }
    }
  })

  if (!booking) {
    return NextResponse.json(
      { error: 'Invalid ticket' },
      { status: 404 }
    )
  }

  if (booking.event.organizerId !== organizerId) {
    return NextResponse.json(
      { error: 'Unauthorized ticket scan' },
      { status: 403 }
    )
  }

  if (booking.status === 'CHECKED_IN') {
    return NextResponse.json(
      { error: 'Ticket already checked in' },
      { status: 409 }
    )
  }

  if (booking.status !== 'CONFIRMED') {
    return NextResponse.json(
      { error: 'Ticket is not valid' },
      { status: 400 }
    )
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CHECKED_IN' }
  })

  return NextResponse.json({
    success: true,
    eventTitle: booking.event.title,
    ticketId: booking.ticketId,
    quantity: booking.quantity,
    attendeeId: booking.userId
  })
}
