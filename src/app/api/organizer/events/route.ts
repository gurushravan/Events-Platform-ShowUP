import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { getOrCreateUser } from '@/lib/getOrCreateUser'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const dbUser = await getOrCreateUser(user)

    // 🔒 RBAC CHECK
    if (dbUser.role !== 'ORGANIZER' && dbUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const events = await prisma.event.findMany({
      where: {
        organizerId: dbUser.id
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

  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}