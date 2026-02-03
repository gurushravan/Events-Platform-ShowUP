import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = await req.json()

  if (!userId) {
    return NextResponse.json([], { status: 400 })
  }

  const events = await prisma.event.findMany({
    where: {
      organizerId: userId
    },
    include: {
      bookings: {
        where: {
          status: {
            in: ['CONFIRMED', 'CHECKED_IN']
          }
        },
        select: {
          quantity: true,
          status: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  })

  const result = events.map(event => {
    const booked = event.bookings
      .filter(b => b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + b.quantity, 0)

    const checkedIn = event.bookings
      .filter(b => b.status === 'CHECKED_IN')
      .reduce((sum, b) => sum + b.quantity, 0)

    return {
      id: event.id,
      title: event.title,
      date: event.date,
      capacity: event.capacity,
      booked,
      checkedIn,
      remaining: event.capacity - booked - checkedIn,
      isDeleted: event.isDeleted
    }
  })

  return NextResponse.json(result)
}
