import { prisma } from '@/lib/prisma'
import HeroSearch from '@/components/home/HeroSearch'
import ExploreResults from '@/components/explore/ExploreResults'

export default async function HomePage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [nearbyEvents, hiddenGems, recentEvents] = await Promise.all([
    prisma.event.findMany({
      where: {
        isDeleted: false,
        date: {
          gte: today
        }
      },
      take: 6,
      orderBy: { date: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        date: true,
        startTime: true,
        endTime: true,
        price: true,
        venue: true,
        city: true,
        capacity: true,
        isHiddenGem: true,
        createdAt: true,
        latitude: true,
        longitude: true
      }
    }),

    prisma.event.findMany({
      where: {
        isHiddenGem: true,
        isDeleted: false,
        date: {
          gte: today
        }
      },
      take: 6,
      orderBy: { date: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        date: true,
        startTime: true,
        endTime: true,
        price: true,
        venue: true,
        city: true,
        capacity: true,
        isHiddenGem: true,
        createdAt: true,
        latitude: true,
        longitude: true
      }
    }),

    prisma.event.findMany({
      where: {
        isDeleted: false,
        date: {
          gte: today
        }
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        date: true,
        startTime: true,
        endTime: true,
        price: true,
        venue: true,
        city: true,
        capacity: true,
        isHiddenGem: true,
        createdAt: true,
        latitude: true,
        longitude: true
      }
    })
  ])

  return (
    <main>
      <HeroSearch />

      <section className="mx-auto max-w-7xl px-4 py-8 text-white">
        <h2 className="mb-4 text-lg font-semibold">
          Happening Near You
        </h2>

        <ExploreResults events={nearbyEvents} />
      </section>

      {hiddenGems.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 text-white">
          <h2 className="mb-4 text-lg font-semibold">
            Hidden Gems
          </h2>

          <ExploreResults events={hiddenGems} />
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-8 text-white">
        <h2 className="mb-4 text-lg font-semibold">
          Browse by Category
        </h2>

        <div className="flex flex-wrap gap-3">
          {[
            'Music',
            'Comedy',
            'Sports',
            'Workshops',
            'Theatre',
            'Tech'
          ].map(category => (
            <a
              key={category}
              href={`/explore?category=${category}`}
              className="
                rounded-full
                border border-white/15
                bg-white/5
                px-4 py-2 text-sm text-white/80
                hover:bg-white/10
                transition
              "
            >
              {category}
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 text-white">
        <h2 className="mb-4 text-lg font-semibold">
          Recently Added
        </h2>

        <ExploreResults events={recentEvents} />
      </section>
    </main>
  )
}