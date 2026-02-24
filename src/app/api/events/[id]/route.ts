import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { getOrCreateUser } from '@/lib/getOrCreateUser'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const event = await prisma.event.findFirst({
    where: {
      id,
      isDeleted: false
    }
  })

  if (!event) {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(event)
}

async function authenticate(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) return null

  const { data: { user }, error } =
    await supabase.auth.getUser(token)

  if (error || !user) return null

  return await getOrCreateUser(user)
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const dbUser = await authenticate(req)

  if (!dbUser) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const event = await prisma.event.findUnique({
    where: { id }
  })

  if (!event || event.isDeleted) {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    )
  }

  // 🔒 RBAC + Ownership check
  if (
    dbUser.role !== 'ADMIN' &&
    event.organizerId !== dbUser.id
  ) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  const body = await req.json()

  const updated = await prisma.event.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      category: body.category,
      date: new Date(body.date),
      startTime: body.startTime,
      endTime: body.endTime,
      price: body.price,
      venue: body.venue,
      city: body.city,
      capacity: body.capacity,
      isHiddenGem: body.isHiddenGem
    }
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const dbUser = await authenticate(req)

  if (!dbUser) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const event = await prisma.event.findUnique({
    where: { id }
  })

  if (!event) {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    )
  }

  // 🔒 RBAC + Ownership check
  if (
    dbUser.role !== 'ADMIN' &&
    event.organizerId !== dbUser.id
  ) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  await prisma.event.update({
    where: { id },
    data: { isDeleted: true }
  })

  return NextResponse.json({ success: true })
}