export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import EventHeader from '@/components/events/EventHeader'
import EventMeta from '@/components/events/EventMeta'
import EventActions from '@/components/events/EventActions'
import BookCTA from '@/components/events/BookCTA'
import { prisma } from '@/lib/prisma'

export default async function EventDetailsPage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const { id } = await props.params

  const event = await prisma.event.findFirst({
    where: {
      id,
      isDeleted: false
    }
  })

  if (!event) {
    notFound()
  }

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-6 text-white">

        {/* EVENT IMAGE */}
       {event.imageUrl && (
          <div className="mb-6 overflow-hidden rounded-lg bg-black/40 flex items-center justify-center">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="max-h-96 w-auto object-contain"
            />
          </div>
        )}

        <div className="flex items-start justify-between">
          <EventHeader
            title={event.title}
            category={event.category}
            isTrustedOrganizer={false}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="rounded-lg border border-white/10 bg-card/80 p-4 backdrop-blur-sm">
              <EventMeta
                date={event.date}
                startTime={event.startTime}
                endTime={event.endTime}
                venue={event.venue}
                city={event.city}
              />
            </div>

            <section className="rounded-lg border border-white/10 bg-card/80 p-4 backdrop-blur-sm">
              <h2 className="mb-2 text-sm font-semibold text-white">
                About this event
              </h2>
              <p className="text-sm leading-relaxed text-white/70">
                {event.description}
              </p>
            </section>
          </div>

          <EventActions
            price={event.price}
            eventDate={event.date}
          >
            <BookCTA eventId={event.id} />
          </EventActions>
        </div>
      </main>
    </>
  )
}