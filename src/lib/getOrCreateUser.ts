import { prisma } from '@/lib/prisma'

export async function getOrCreateUser(supabaseUser: any) {
  if (!supabaseUser?.id || !supabaseUser?.email) {
    throw new Error('Invalid Supabase user')
  }

  let user = await prisma.user.findUnique({
    where: { id: supabaseUser.id }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: 'USER'
      }
    })
  }

  return user
}