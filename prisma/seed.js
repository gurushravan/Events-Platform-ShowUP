const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Clear data in correct order (because of foreign keys)
  await prisma.booking.deleteMany()
  await prisma.savedEvent.deleteMany()
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()

  // Create Organizer Users
  const comedyOrg = await prisma.user.create({
    data: {
      id: 'org-comedy',
      email: 'comedy@test.com',
      role: 'ORGANIZER'
    }
  })

  const musicOrg = await prisma.user.create({
    data: {
      id: 'org-music',
      email: 'music@test.com',
      role: 'ORGANIZER'
    }
  })

  const workshopOrg = await prisma.user.create({
    data: {
      id: 'org-workshop',
      email: 'workshop@test.com',
      role: 'ORGANIZER'
    }
  })

  // Create Events
  await prisma.event.createMany({
    data: [
      {
        title: 'Stand-up Comedy Night',
        description:
          'An intimate stand-up comedy show featuring upcoming comics.',
        category: 'Comedy',
        date: new Date('2026-02-01'),
        startTime: '19:30',
        endTime: '21:00',
        price: 399,
        venue: 'Indiranagar Social',
        city: 'Chennai',
        capacity: 120,
        isHiddenGem: true,
        isDeleted: false,
        organizerId: comedyOrg.id
      },
      {
        title: 'Open Mic Comedy Evening',
        description:
          'A relaxed open mic night with new and experienced comedians.',
        category: 'Comedy',
        date: new Date('2026-02-02'),
        startTime: '20:00',
        endTime: '22:00',
        price: 299,
        venue: 'Dialogue Cafe',
        city: 'Chennai',
        capacity: 80,
        isHiddenGem: false,
        isDeleted: false,
        organizerId: comedyOrg.id
      },
      {
        title: 'Live Indie Music Gig',
        description:
          'Live performances by independent artists and bands.',
        category: 'Music',
        date: new Date('2026-02-03'),
        startTime: '20:00',
        endTime: '22:30',
        price: 499,
        venue: 'Hard Rock Cafe',
        city: 'Chennai',
        capacity: 200,
        isHiddenGem: false,
        isDeleted: false,
        organizerId: musicOrg.id
      },
      {
        title: 'Watercolor Workshop for Beginners',
        description:
          'Learn the basics of watercolor painting in a hands-on workshop.',
        category: 'Workshops',
        date: new Date('2026-02-04'),
        startTime: '11:00',
        endTime: '14:00',
        price: 350,
        venue: 'Art House Studio',
        city: 'Chennai',
        capacity: 40,
        isHiddenGem: false,
        isDeleted: false,
        organizerId: workshopOrg.id
      },
      {
        title: 'Pottery Workshop for Beginners',
        description:
          'Hands-on pottery workshop focused on fundamentals.',
        category: 'Workshops',
        date: new Date('2026-02-05'),
        startTime: '10:00',
        endTime: '13:00',
        price: 450,
        venue: 'Clay Station',
        city: 'Chennai',
        capacity: 35,
        isHiddenGem: true,
        isDeleted: false,
        organizerId: workshopOrg.id
      }
    ]
  })

  console.log('Seed data inserted successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })