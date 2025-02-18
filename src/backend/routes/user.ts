import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = new Hono()

// Get current user profile
router.get('/me', async (c) => {
  const user = c.get('jwtPayload')
  const userProfile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      nip: true,
      nis: true,
      class: true,
      createdAt: true
    }
  })

  return c.json(userProfile)
})

// Get all students (for teachers)
router.get('/students', async (c) => {
  const user = c.get('jwtPayload')
  if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
    return c.json({ error: 'Unauthorized' }, 403)
  }

  const className = c.req.query('class')
  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      ...(className ? { class: className } : {})
    },
    select: {
      id: true,
      name: true,
      nis: true,
      class: true,
      email: true
    }
  })

  return c.json(students)
})

// Get all teachers (for admin)
router.get('/teachers', async (c) => {
  const user = c.get('jwtPayload')
  if (user.role !== 'ADMIN') {
    return c.json({ error: 'Unauthorized' }, 403)
  }

  const teachers = await prisma.user.findMany({
    where: {
      role: 'TEACHER'
    },
    select: {
      id: true,
      name: true,
      nip: true,
      email: true
    }
  })

  return c.json(teachers)
})

export { router as userRouter }
