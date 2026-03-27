import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

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

    try {
      await transporter.sendMail({
        from: `"Event Platform" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, 
        subject: 'New User Signup',
        text: `New user registered:\n\nEmail: ${supabaseUser.email}\nUser ID: ${supabaseUser.id}`,
      })
    } catch (error) {
      console.error('Email notification failed:', error)
    }
  }

  return user
}