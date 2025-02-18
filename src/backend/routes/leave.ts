import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = new Hono()

const createLeaveSchema = z.object({
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  type: z.string(),
  reason: z.string()
})

// Create leave request
router.post('/', async (c) => {
  try {
    const user = c.get('jwtPayload')
    const body = await c.req.json()
    const data = createLeaveSchema.parse(body)

    const leave = await prisma.leave.create({
      data: {
        ...data,
        userId: user.id,
        status: user.role === 'TEACHER' ? 'APPROVED' : 'PENDING'
      }
    })

    return c.json(leave)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get user's leave requests
router.get('/', async (c) => {
  const user = c.get('jwtPayload')
  const leaves = await prisma.leave.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return c.json(leaves)
})

// Get pending leave requests (for teachers/admin)
router.get('/pending', async (c) => {
  const user = c.get('jwtPayload')
  if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
    return c.json({ error: 'Unauthorized' }, 403)
  }

  const leaves = await prisma.leave.findMany({
    where: {
      status: 'PENDING',
      user: {
        role: 'STUDENT'
      }
    },
    include: {
      user: {
        select: {
          name: true,
          nis: true,
          class: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return c.json(leaves)
})

// Approve/reject leave request
router.patch('/:id/status', async (c) => {
  const user = c.get('jwtPayload')
  if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
    return c.json({ error: 'Unauthorized' }, 403)
  }

  const leaveId = c.req.param('id')
  const { status } = await c.req.json()

  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return c.json({ error: 'Invalid status' }, 400)
  }

  const leave = await prisma.leave.update({
    where: { id: leaveId },
    data: { status }
  })

  return c.json(leave)
})

export { router as leaveRouter }
